class ResizeObserverStore {
    observer = new Map()

    get(target){
        return this.observer.get(target) || []
    }

    set(target,observer){
        const observers = this.observer.get(target)
        if(observers){
            observers.push(observer)
        }else{
            this.observer.set(target,[observer])
        }
    }

    remove(target){
        const observers = this.observer.get(target)
        if(observers){
            observers.forEach(observer => {
                observer.disconnect()
            });
            this.observer.delete(target)
        }
    }
}

const resizeObserverStore = new ResizeObserverStore()


export const useResizeObserver = (target,callback)=>{
    const observer = new ResizeObserver(callback)
    observer.observe(target)
    resizeObserverStore.set(target,observer)
    return observer
}

export const removeResizeObserver = (target)=>{
    resizeObserverStore.remove(target)
}