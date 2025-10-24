function processCouponDataWithMoment(originalData) {
    const now = moment();
    const currentDate = now.format('YYYY-MM-DD');
    const currentTime = now.format('HH:mm');

    const result = [];

    originalData.forEach(item => {
        const [startDateStr, endDateStr] = item.date;
        const startDate = moment(startDateStr, 'YYYY-MM-DD');
        const endDate = moment(endDateStr, 'YYYY-MM-DD');

        // 检查日期范围是否包含今天或之后
        if (endDate.isSameOrAfter(now, 'day')) {
            // 生成这个日期范围内的每一天
            let currentDay = moment.max(startDate, now.startOf('day')); // 从今天或开始日期中较晚的开始

            while (currentDay.isSameOrBefore(endDate, 'day')) {
                const dayStr = currentDay.format('YYYY-MM-DD');

                // 为每一天添加时间段
                item.timeList.forEach(timeSlot => {
                    const [startTime, endTime] = timeSlot.value;
                    const slotStart = moment(`${dayStr} ${startTime}`, 'YYYY-MM-DD HH:mm');
                    const slotEnd = moment(`${dayStr} ${endTime}`, 'YYYY-MM-DD HH:mm');

                    // 只添加未来时间段或今天还未结束的时间段
                    if (slotStart.isAfter(now) ||
                        (currentDay.isSame(now, 'day') && slotEnd.isSameOrAfter(now))) {

                        result.push({
                            date: dayStr,
                            time: timeSlot.value,
                            startTime: slotStart.format('YYYY-MM-DD HH:mm'),
                            endTime: slotEnd.format('YYYY-MM-DD HH:mm'),
                            couponList: item.couponList,
                            couponData: item.couponData,
                            // 用于排序
                            _startMoment: slotStart
                        });
                    }
                });

                currentDay.add(1, 'day');
            }
        }
    });

    // 按时间排序
    result.sort((a, b) => a._startMoment - b._startMoment);

    // 移除临时属性
    return result.map(({ _startMoment, ...rest }) => rest);
}