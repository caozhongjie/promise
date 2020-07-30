class HD{
    static PENDING = 'pending'
    static FULFILLED = 'fulfilled'
    static REJECTED = 'rejected'
    constructor(executor) {
        this.status = HD.PENDING // 状态
        this.value = null
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
            this.callbacks.map(callback => {
                callback.onFulfilled(value)
            })
            // if(this.callbacks.length > 0) {
            //     this.callbacks.map(callback => {
            //         callback.onFulfilled(value)
            //     })
            // }
        }
    }
    reject(reason) {
        if(this.status === HD.PENDING) {
            this.status = HD.REJECTED
            this.value = reason
            this.callbacks.map(callback => {
                callback.onRejected(reason)
            })
        }
    }
    then(onFulfilled, onRejected) {
        if(typeof onFulfilled !== "function") { // 如果传递进来的不是一个函数，那么就转成函数
            onFulfilled = ()=>{}
        }
        if(typeof onRejected !== "function") {
            onRejected = ()=>{}
        }
        if(this.status === HD.PENDING) { //如果resolve和reject还没有执行(异步操作)就调用了then方法，此时就将函数保存起来，在resolve或者reject执行后再进行调用
            this.callbacks.push({
                onFulfilled: value => { // onFuifilled对象属性
                    try { // 捕获错误
                        onFulfilled(value) // 形参中的函数，两者不同
                    }catch (e) {
                        onRejected(e)
                    }
                },
                onRejected: value => {
                    try {
                        onRejected(value)
                    }catch (e) {
                        onRejected(e)
                    }
                }
            })
        }
        if(this.status ===HD.FULFILLED) { //让其在对应的状态只能执行对应状态的函数
            setTimeout(()=>{ // 为了实现promise的异步执行机制，then和catch中的回调是异步的
                try { // 将外部的错误捕获到里面来
                    onFulfilled(this.value)
                }catch (e) {
                    onRejected(e)
                }
            },1000)


        }
        if(this.status === HD.REJECTED) {
            setTimeout(()=>{ // 为了实现promise的异步执行机制，then和catch中的回调是异步的
                try {
                    onRejected(this.value)
                }catch (e) {
                    onRejected(e)
                }
            })
        }
    }
}
// new Promise()
