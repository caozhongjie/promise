class HD{
    static PENDING = 'pending'
    static FULFILLED = 'fulfilled'
    static REJECTED = 'rejected'
    constructor(executor) {
        this.status = HD.PENDING // 状态
        this.value = null
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
        }
    }
    reject(reason) {
        console.log(11111)
        if(this.status === HD.PENDING) {
            this.status = HD.REJECTED
            this.value = reason
        }
    }
    then(onFulfilled, onRejected) {
        if(typeof onFulfilled !== "function") { // 如果传递进来的不是一个函数，那么就转成函数
            onFulfilled = ()=>{}
        }
        if(typeof onRejected !== "function") {
            onRejected = ()=>{}
        }
        if(this.status ===HD.FULFILLED) { //让其在对应的状态只能执行对应状态的函数
            onFulfilled(this.value)
        }
        if(this.status === HD.REJECTED) {
            onRejected(this.value)
        }

    }
}
// new Promise()
