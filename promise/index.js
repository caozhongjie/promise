class HD{
    static PENDING = 'pending'
    static FULFILLED = 'fulfilled'
    static REJECTED = 'rejected'
    constructor(executor) {
        this.status = HD.PENDING // 状态
        this.value = null // resolve返回的值
        this.reason = null // reject返回的值
        this.callbacks = [] // 存放异步操作时之后要执行的函数
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))  //只有改变this的指向,resolve中才能拿到status的值
        }catch (e) {
            this.reject(e)
        }
    }
    resolve(value) { // 这里的this是严格模式下的this指向，指向的是window,使用bind()绑定this
        if(this.status === HD.PENDING) { // 让状态不可更改，只能从pending->resolve
            this.status = HD.FULFILLED
            this.value = value
            if(this.callbacks.length > 0) { // 如果大于0，则表示为异步
                setTimeout(() => { // 加上异步使在调用时保持resolve为异步执行
                    this.callbacks.map(callback => {
                        callback.onFulfilled(value)
                    })
                })
            }
        }
    }
    reject(reason) {
        if(this.status === HD.PENDING) {
            this.status = HD.REJECTED
            this.value = reason
            if(this.callbacks.length > 0) {
                setTimeout(() => {
                    this.callbacks.map(callback => {
                        callback.onRejected(reason)
                    })
                })
            }
        }
    }
    then(onFulfilled, onRejected) { //为了进行链式操作,then()必须返回一个promise，只有promise才有then方法
        if(typeof onFulfilled !== "function") { // 如果传递进来的不是一个函数，那么就转成函数
            onFulfilled = ()=>this.value // 当then()没有传递参数进来，或者参数不为函数时，此时直接调用value值传递给下一层then   then()的穿透
        }
        if(typeof onRejected !== "function") {
            onRejected = ()=>this.value
        }
        let promise = new HD((resolve, reject) => {
            if(this.status === HD.PENDING) { //如果resolve和reject还没有执行(异步操作)就调用了then方法，此时就将函数保存起来，在resolve或者reject执行后再进行调用
                this.callbacks.push({
                    onFulfilled: value => { // onFuifilled对象属性
                        this.parse(promise, onFulfilled(value), resolve, reject)
                        // try { // 捕获错误
                        //     let result = onFulfilled(value) // 形参中的函数，两者不同
                        //     if(result instanceof HD) { // 如果返回的是一个promise对象
                        //         result.then(resolve, reject)
                        //         // result.then(value => {
                        //         //     resolve(value)
                        //         // }, reason => {
                        //         //     reject(reason)
                        //         // })
                        //     } else {
                        //         resolve(result)
                        //     }
                        // }catch (e) {
                        //     reject(e)
                        // }
                    },
                    onRejected: value => {
                        this.parse(promise,onRejected(value), resolve, reject)
                        // try {
                        //     let result =  onRejected(value)
                        //     resolve(result)
                        // }catch (e) {
                        //     reject(e)
                        // }
                    }
                })
            }
            if(this.status ===HD.FULFILLED) { //让其在对应的状态只能执行对应状态的函数
                setTimeout(()=>{ // 为了实现promise的异步执行机制，then和catch中的回调是异步的
                    this.parse(promise,onFulfilled(this.value), resolve, reject)
                    // try { // 将外部的错误捕获到里面来
                    //   let result =  onFulfilled(this.value) // 在此时拿到then(resolve) return的值
                    //     console.log(result)
                    //     if(result instanceof HD) { // 如果返回的是一个promise对象
                    //         result.then(resolve, reject)
                    //         // result.then(value => {
                    //         //     resolve(value)
                    //         // }, reason => {
                    //         //     reject(reason)
                    //         // })
                    //     } else {
                    //         resolve(result)
                    //     }
                    //
                    // }catch (e) {
                    //     reject(e)
                    // }
                },1000)
            }
            if(this.status === HD.REJECTED) {
                setTimeout(()=>{ // 为了实现promise的异步执行机制，then和catch中的回调是异步的
                    this.parse(promise,onRejected(this.value), resolve, reject)
                    // try {
                    //   let result = onRejected(this.value)
                    //     if(result instanceof HD) { // 如果返回的是一个promise对象
                    //         result.then(resolve, reject)
                    //         // result.then(value => {
                    //         //     resolve(value)
                    //         // }, reason => {
                    //         //     reject(reason)
                    //         // })
                    //     } else {
                    //         resolve(result)
                    //     }
                    // }catch (e) {
                    //     reject(e)
                    // }
                })
            }
        })
        return promise
    }
    parse(promise, result, resolve, reject) {
        if(promise === result) { // 防止自己调用自己
            throw new TypeError('Chaining cycle detected for promise')
        }
        try {
            if(result instanceof HD) { // 如果返回的是一个promise对象
                result.then(resolve, reject)
                // result.then(value => {
                //     resolve(value)
                // }, reason => {
                //     reject(reason)
                // })
            } else {
                resolve(result)
            }
        }catch (e) {
            reject(e)
        }
    }
    static resolve(value) {
        return new HD((resolve, reject) => {
            if(value instanceof HD) {
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }
    static reject(value) {
        return new HD((resolve, reject) => {
            if(value instanceof HD) {
                value.then(resolve, reject)
            } else {
                reject(value)
            }
        })
    }
}
// new Promise()
