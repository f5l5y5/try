// === 修复版 IndexDB 银行转账案例 ===
console.clear();
console.log('🏦 启动修复版 IndexDB 银行转账系统...');

let db; // 全局数据库引用

// 1. 打开数据库
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BankDemoDB_Fixed', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('📦 数据库升级，创建对象存储空间...');
      
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        console.log('✅ 创建 users 存储空间');
      }
      
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        console.log('✅ 创建 transactions 存储空间');
      }
    };
  });
};

// 2. 初始化测试数据（简化版）
const initTestData = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readwrite');
    const userStore = transaction.objectStore('users');
    
    // 先清空
    const clearReq = userStore.clear();
    clearReq.onsuccess = () => {
      console.log('🗑️ 清空旧数据');
    };
    
    // 添加测试数据
    const users = [
      { id: 'alice', name: 'Alice', balance: 1000 },
      { id: 'bob', name: 'Bob', balance: 500 },
      { id: 'charlie', name: 'Charlie', balance: 200 }
    ];
    
    let completed = 0;
    users.forEach(user => {
      const addReq = userStore.add(user);
      addReq.onsuccess = () => {
        completed++;
        if (completed === users.length) {
          console.log('📊 测试数据初始化完成');
          resolve();
        }
      };
      addReq.onerror = () => reject(addReq.error);
    });
    
    transaction.oncomplete = () => {
      console.log('✅ 数据初始化事务完成');
    };
  });
};

// 3. 修复版转账函数 - 使用更可靠的同步方式
const transferMoney = (fromUser, toUser, amount) => {
  return new Promise((resolve, reject) => {
    console.log(`\n💸 开始转账: ${fromUser} → ${toUser} ¥${amount}`);
    
    const transaction = db.transaction(['users', 'transactions'], 'readwrite');
    const userStore = transaction.objectStore('users');
    const txStore = transaction.objectStore('transactions');
    
    let fromAccount = null;
    let toAccount = null;
    
    // 步骤1: 读取转出方
    const getFromReq = userStore.get(fromUser);
    getFromReq.onsuccess = () => {
      fromAccount = getFromReq.result;
      if (!fromAccount) {
        transaction.abort();
        reject(new Error(`用户 ${fromUser} 不存在`));
        return;
      }
      if (fromAccount.balance < amount) {
        transaction.abort();
        reject(new Error(`余额不足: ${fromAccount.balance} < ${amount}`));
        return;
      }
      console.log(`   ✓ 读取 ${fromUser}: ¥${fromAccount.balance}`);
      
      // 步骤2: 读取转入方
      const getToReq = userStore.get(toUser);
      getToReq.onsuccess = () => {
        toAccount = getToReq.result;
        if (!toAccount) {
          transaction.abort();
          reject(new Error(`用户 ${toUser} 不存在`));
          return;
        }
        console.log(`   ✓ 读取 ${toUser}: ¥${toAccount.balance}`);
        
        // 步骤3: 立即更新余额（在同一个事件循环中）
        fromAccount.balance -= amount;
        const putFromReq = userStore.put(fromAccount);
        putFromReq.onsuccess = () => {
          console.log(`   ✓ ${fromUser} 扣款后: ¥${fromAccount.balance}`);
          
          toAccount.balance += amount;
          const putToReq = userStore.put(toAccount);
          putToReq.onsuccess = () => {
            console.log(`   ✓ ${toUser} 收款后: ¥${toAccount.balance}`);
            
            // 步骤4: 记录交易
            const txRecord = {
              fromUser: fromUser,
              toUser: toUser,
              amount: amount,
              timestamp: new Date().toISOString(),
              status: 'completed'
            };
            const addTxReq = txStore.add(txRecord);
            addTxReq.onsuccess = () => {
              console.log(`   ✓ 交易记录已保存`);
              
              // 所有操作成功，事务会自动提交
              transaction.oncomplete = () => {
                console.log('✅ 事务提交成功！');
                resolve({
                  success: true,
                  fromBalance: fromAccount.balance,
                  toBalance: toAccount.balance
                });
              };
            };
            addTxReq.onerror = () => {
              transaction.abort();
              reject(new Error('保存交易记录失败'));
            };
          };
          putToReq.onerror = () => {
            transaction.abort();
            reject(new Error('更新接收方余额失败'));
          };
        };
        putFromReq.onerror = () => {
          transaction.abort();
          reject(new Error('更新发送方余额失败'));
        };
      };
      getToReq.onerror = () => {
        transaction.abort();
        reject(new Error('读取接收方失败'));
      };
    };
    getFromReq.onerror = () => {
      transaction.abort();
      reject(new Error('读取发送方失败'));
    };
    
    transaction.onerror = () => {
      console.error('❌ 事务错误:', transaction.error);
      reject(new Error('事务执行失败'));
    };
  });
};

// 4. 查询用户（可靠版本）
const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readonly');
    const userStore = transaction.objectStore('users');
    const getAllReq = userStore.getAll();
    
    getAllReq.onsuccess = () => {
      console.log('\n📋 当前用户余额:');
      getAllReq.result.forEach(user => {
        console.log(`   ${user.name} (${user.id}): ¥${user.balance}`);
      });
      resolve(getAllReq.result);
    };
    getAllReq.onerror = () => reject(getAllReq.error);
  });
};

// 5. 查询交易记录
const getTransactions = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['transactions'], 'readonly');
    const txStore = transaction.objectStore('transactions');
    const getAllReq = txStore.getAll();
    
    getAllReq.onsuccess = () => {
      console.log('\n📜 交易记录:');
      if (getAllReq.result.length === 0) {
        console.log('   暂无记录');
      } else {
        getAllReq.result.forEach(tx => {
          console.log(`   ${tx.fromUser} → ${tx.toUser} ¥${tx.amount} [${new Date(tx.timestamp).toLocaleTimeString()}]`);
        });
      }
      resolve(getAllReq.result);
    };
  });
};

// 主执行流程
const runDemo = async () => {
  try {
    // 打开数据库
    await openDB();
    console.log('✅ 数据库连接成功\n');
    
    // 初始化数据
    await initTestData();
    await getAllUsers();
    
    // 测试转账1
    await transferMoney('alice', 'bob', 200);
    await getAllUsers();
    
    // 测试转账2  
    await transferMoney('bob', 'charlie', 100);
    await getAllUsers();
    
    // 查看交易记录
    await getTransactions();
    
    // 测试回滚
    console.log('\n🔄 测试回滚（余额不足）...');
    try {
      await transferMoney('charlie', 'alice', 1000); // Charlie只有200
    } catch (error) {
      console.log(`✅ 正确回滚: ${error.message}`);
    }
    
    // 最终状态
    console.log('\n🎉 最终状态:');
    await getAllUsers();
    await getTransactions();
    
    db.close();
    console.log('\n✅ 演示完成');
    
  } catch (error) {
    console.error('💥 错误:', error);
  }
};

// 启动
runDemo();