class MyPromise {
    // promise的三种状态
    static PENDING = 'pending'
    static FULFILLED = 'fulfilled'
    static REJECTED = 'rejected'

    constructor(executor) {
        this.status = MyPromise.PENDING // 保存当前状态,默认为pending
        this.value = '' // 存储状态为fulfilled时的值
        this.reason = '' // 存储状态为rejected时的值
        this.callBacks = [] // 用于存放回调函数
        executor(this.resolve.bind(this), this.reject.bind(this)) // 将this绑定到resolve和reject中，以此来拿到构造函数的值
    }

    resolve(value) {
        if (this.status === MyPromise.PENDING) { // 为了保证每次只能执行一个状态的改变
            this.status = MyPromise.FULFILLED
            this.value = value // 将传递进来的值保存，以便传递给下一步then()
            // 如果异步完成后执行resolve，则调用保存的函数,确保then()是在resolve/reject之后调用的
            setTimeout(() => {
                this.callBacks.map(callback => {
                    callback.onFulfilled(this.value)
                })
            })
        }
    }

    reject(reason) {
        if (this.status === MyPromise.PENDING) {
            this.status = MyPromise.REJECTED
            this.reason = reason // 将传递进来的值保存，以便传递给下一步then()// 如果异步完成后执行rejected，则调用保存的函数
            setTimeout(() => {
                this.callBacks.map(callback => {
                    callback.onRejected(this.reason)
                })
            })
        }
    }

    then(onFulfilled, onRejected) { // 每一次then()之后下一个then()状态都是pending
        let promise;
        let rejectStatus = false // 用于标志当前then()是否未进行任何操作，且上一个状态为reject
        if (typeof onFulfilled !== 'function') { // 防止传递进来的不是一个函数
            onFulfilled = () => this.value
        }
        if (typeof onRejected !== 'function') {
            onRejected = () => this.reason
            rejectStatus = true // 当没有onReject传递进来时，则置为true
        }
        if (this.status === MyPromise.PENDING) {
            promise = new MyPromise((resolve, reject) => {
                this.callBacks.push({ // 在异步执行resolve时，先将函数保存起来，等到resolve或者reject之后再来执行该函数
                    onFulfilled: (value) => { // 这个onfulfilled是属性名, value值就是在resolve中调用onfulfilled传递进来的值
                        this.resolveParse(promise, onFulfilled(value), resolve, reject)
                        // try {
                        //     let result = onFulfilled(value) // 这个onfulfilled是函数 **在返回promise中，这里拿到返回的promise值**
                        //     if (promise === result) { // 不能返回本身
                        //         throw new TypeError('Chaining cycle detected for promise')
                        //     }
                        //     if (result instanceof MyPromise) {
                        //         result.then(value => {
                        //             resolve(value) // **此处resolve的是我们在这里new出来的对象promise的函数,这个promise是我们将最终then()出去的结果，不是then()中返回来的这个，切勿弄乱**
                        //         }, reason => {
                        //             reject(reason)
                        //         })
                        //     } else {
                        //         resolve(result)
                        //     }
                        // } catch (e) {
                        //     reject(e) // 将上一个then()中的错误信息抛给下一个then()  下面同理
                        // }
                    },
                    onRejected: (reason) => {
                        this.rejectParse(promise, onRejected(reason), resolve, reject, rejectStatus)
                        // try {
                        //     let result = onRejected(reason)
                        //     if (promise === result) { // 不能返回本身
                        //         throw new TypeError('Chaining cycle detected for promise')
                        //     }
                        //     if (result instanceof MyPromise) {
                        //         result.then(value => {
                        //             resolve(value)
                        //         }, reason => {
                        //             reject(reason)
                        //         })
                        //     } else {
                        //         if (rejectStatus) { // 当状态为reject,且then()无操作时，则将reject状态传递给下一个then()方法。否则传递resolve()
                        //             reject(result)
                        //         } else {
                        //             resolve(result)
                        //         }
                        //     }
                        // } catch (e) {
                        //     reject(e)
                        // }
                    }
                })
            })
        }
        if (this.status === MyPromise.FULFILLED) {
            promise = new MyPromise((resolve, reject) => {
                setTimeout(() => {
                    this.resolveParse(onFulfilled(this.value), resolve, reject) // 将下面代码放入函数中
                    // try { //如果then()中有错误发生，则将错误信息捕获放入onRejected中
                    //     let result = onFulfilled(this.value) // 在then()中调用的onFulfilled或者onRejected中的return的值，即等于该函数执行完之后的值，拿到该值之后，重新resolve一下，传递给下一个promise
                    //     if (promise ===result) { // 不能返回本身   因为这里是异步执行的，所以可以先拿到自己本身的值 然后再进行比较
                    //         throw new TypeError('Chaining cycle detected for promise')
                    //     }
                    //     if(result instanceof MyPromise) { // 判断返回的状态是否是promise
                    //         result.then(value => {
                    //             resolve(value)
                    //         }, reason => {
                    //             reject(reason)
                    //         })
                    //     } else {
                    //         resolve(result)
                    //     }
                    // } catch (e) {
                    //     reject(e)
                    // }
                })
            })
        }
        if (this.status === MyPromise.REJECTED) {
            promise = new MyPromise((resolve, reject) => {
                setTimeout(() => { // 因为then()是微任务，所以加了延时器
                    this.rejectParse(promise, onRejected(this.reason), resolve, reject, rejectStatus)
                    // try {
                    //     let result = onRejected(this.reason)
                    //     if (promise === result) { // 不能返回本身
                    //         throw new TypeError('Chaining cycle detected for promise')
                    //     }
                    //     if (result instanceof MyPromise) {
                    //         result.then((value) => {
                    //             resolve(value)
                    //         }, reason => {
                    //             reject(reason)
                    //         })
                    //     } else {
                    //         if (rejectStatus) {
                    //             reject(result)
                    //         } else {
                    //             resolve(result) // 因为当前then状态不会影响下一个promise的状态，所以都是用resolve来调用新的promise
                    //         }
                    //     }
                    //
                    // } catch (e) {
                    //     reject(e)
                    // }
                })
            })
        }
        return promise // 返回一个新的promise后就可以继续调用then()  返回的状态时pending  因为resolve/reject在执行时是异步的
    }

    catch(onRejected) {
        return this.then(null, onRejected)
    }

    resolveParse(promise, result, resolve, reject) {
        try { //如果then()中有错误发生，则将错误信息捕获放入onRejected中
            if (promise === result) { // 不能返回本身   因为这里是异步执行的，所以可以先拿到自己本身的值 然后再进行比较
                throw new TypeError('Chaining cycle detected for promise')
            }
            if (result instanceof MyPromise) { // 判断返回的状态是否是promise
                result.then(value => {
                    resolve(value)
                }, reason => {
                    reject(reason)
                })
            } else {
                resolve(result)
            }
        } catch (e) {
            reject(e)
        }
    }
    rejectParse(promise, result, resolve, reject, status) {
        try {
            if (promise === result) { // 不能返回本身
                throw new TypeError('Chaining cycle detected for promise')
            }
            if (result instanceof MyPromise) {
                result.then((value) => {
                    resolve(value)
                }, reason => {
                    reject(reason)
                })
            } else {
                if (status) {
                    reject(result)
                } else {
                    resolve(result) // 因为当前then状态不会影响下一个promise的状态，所以都是用resolve来调用新的promise
                }
            }

        } catch (e) {
            reject(e)
        }
    }
    static resolve(value) {
        return new MyPromise((resolve, reject) => {
            if (value instanceof MyPromise) { // 如果调用静态方法resolve时值为新的promise
                if (value instanceof MyPromise) { // 判断返回的状态是否是promise
                    value.then(value1 => {
                        resolve(value1)
                    }, reason => {
                        reject(reason)
                    })
                } else {
                    resolve(value)
                }
            } else {
                resolve(value)
            }
        })
    }

    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason)
        })
    }

    static all(promises) {
        return new MyPromise((resolve, reject) => {
            let resolves = []
            promises.forEach(promise => {
                promise.then(value => {
                    resolves.push(value)
                    if (resolves.length === promises.length) {
                        resolve(resolves)
                    }
                }, reason => {
                    reject(reason)
                })
            })
        })

    }

    static race(promises) {
        return new MyPromise((resolve, reject) => {
            promises.map(promise => {
                promise.then(value => {
                    resolve(value)
                }, reason => {
                    reject(reason)
                })
            })
        })
    }
}

