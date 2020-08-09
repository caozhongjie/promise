##最简版的promise
    class MyPromise {
        // promise的三种状态
        static PENDING = 'pending'
        static FULFILLED = 'fulfilled'
        static REJECTED = 'rejected'
        constructor(executor) {
            this.status = MyPromise.PENDING // 保存当前状态,默认为pending
            this.value = '' // 存储状态为fulfilled时的值
            this.reason = '' // 存储状态为rejected时的值
            executor(this.resolve.bind(this), this.reject.bind(this)) // 将this绑定到resolve和reject中，以此来拿到构造函数的值
        }
        resolve(value) {
            if(this.status === MyPromise.PENDING) { // 为了保证每次只能执行一个状态的改变
                this.status = MyPromise.FULFILLED
                this.value = value // 将传递进来的值保存，以便传递给下一步then()
            }
        }
        reject(reason) {
            if(this.status === MyPromise.PENDING) { // 为了保证每次只能执行一个状态的改变
                this.status = MyPromise.REJECTED
                this.reason = reason // 将传递进来的值保存，以便传递给下一步then()
            }
        }
        then(onFulfilled, onRejected) {
            if(this.status === MyPromise.FULFILLED) {
                onFulfilled(this.value)
            }
            if(this.status === MyPromise.REJECTED) {
                onRejected(this.reason)
            }
        }
    }

#如果在then中发生了错误的话将错误抛给onRejected来处理，在promise中，then()属于微任务异步执行的，所以加上setTimeout
       new MyPromise((resolve, reject) => {
                   resolve('解决')
               })
               .then(
                   value =>{
                       console.log('resolve = ' + value111)
                   },
                   reason => {
                       console.log('reject = ' + reason)
                   }
               )   
       console.log('这是先执行的')   

        then(onFulfilled, onRejected) {
            if(typeof onFulfilled !== 'function') { // 防止传递进来的不是一个函数
                onFulfilled = () => {}
            }
            if(typeof onRejected !== 'function') {
                onRejected = () => {}
            }
            if(this.status === MyPromise.FULFILLED) {
                setTimeout(() => {
                    try {
                        onFulfilled(this.value) //如果then()中有错误发生，则将错误信息捕获放入onRejected中
                    } catch (e) {
                        onRejected(e)
                    }
                })
            }
            if(this.status === MyPromise.REJECTED) {
                setTimeout(() => {
                    try {
                        onRejected(this.reason)
                    } catch (e) {
                        onRejected(e)
                    }
                })
            }
        }
#在promise中，可能会在异步执行之后， 拿到异步执行的结果在使用resolve或者reject.新增了callback用于存放resolve之后需要调用的函数
    new MyPromise((resolve, reject) => {
        setTimeout(() => {
            reject('异步状态')
        })
    })
    .then(
        value =>{
            console.log('resolve = ' + value)
        },
        reason => {
            console.log('reject = ' + reason)
        }
    )    

    class MyPromise {
       // promise的三种状态
       static PENDING = 'pending'
       static FULFILLED = 'fulfilled'
       static REJECTED = 'rejected'
       constructor(executor) {
           this.status = MyPromise.PENDING // 保存当前状态,默认为pending
           this.value = '' // 存储状态为fulfilled时的值
           this.reason = '' // 存储状态为rejected时的值
           this.callBacks = [] // **用于存放回调函数**
           executor(this.resolve.bind(this), this.reject.bind(this)) // 将this绑定到resolve和reject中，以此来拿到构造函数的值
       }
       resolve(value) {
           if(this.status === MyPromise.PENDING) { // 为了保证每次只能执行一个状态的改变
               this.status = MyPromise.FULFILLED
               this.value = value // 将传递进来的值保存，以便传递给下一步then()
               // 如果异步完成后执行resolve，则调用保存的函数
               this.callBacks.map(callback =>{
                   callback.onFulfilled(this.value)
               })
           }
       }
       reject(reason) {
           if(this.status === MyPromise.PENDING) { // 为了保证每次只能执行一个状态的改变
               this.status = MyPromise.REJECTED
               this.reason = reason // 将传递进来的值保存，以便传递给下一步then()// 如果异步完成后执行rejected，则调用保存的函数
               this.callBacks.map(callback => {
                   callback.onRejected(this.reason)
               })
           }
       }
       then(onFulfilled, onRejected) {
           if(typeof onFulfilled !== 'function') { // 防止传递进来的不是一个函数
               onFulfilled = () => {}
           }
           if(typeof onRejected !== 'function') {
               onRejected = () => {}
           }
           if(this.status === MyPromise.PENDING) {
               this.callBacks.push({ // **在异步执行resolve时，先将函数保存起来，等到resolve或者reject之后再来执行该函数**
                   onFulfilled,
                   onRejected
               })
           }
           if(this.status === MyPromise.FULFILLED) {
               setTimeout(() => {
                   try {
                       onFulfilled(this.value) //如果then()中有错误发生，则将错误信息捕获放入onRejected中
                   } catch (e) {
                       onRejected(e)
                   }
               })
           }
           if(this.status === MyPromise.REJECTED) {
               setTimeout(() => {
                   try {
                       onRejected(this.reason)
                   } catch (e) {
                       onRejected(e)
                   }
               })
           }
       }
    }
#在我们在上面这种情况下调用then里面的函数，此时可能会出现代码错误（例如调用了不存在的变量），所以我们统一将错误信息抛到reject中去处理
        new MyPromise((resolve, reject) => {
            setTimeout(() => {
                resolve('异步状态')
            })
        })
        .then(
            value =>{
                console.log('resolve = ' + ABC) // 例如这里调用了一个不存在的变量
            },
            reason => {
                console.log('reject = ' + reason)
            }
        )

        then(onFulfilled, onRejected) {
            if(typeof onFulfilled !== 'function') { // 防止传递进来的不是一个函数
                onFulfilled = () => {}
            }
            if(typeof onRejected !== 'function') {
                onRejected = () => {}
            }
            if(this.status === MyPromise.PENDING) {
                this.callBacks.push({ // 在异步执行resolve时，先将函数保存起来，等到resolve或者reject之后再来执行该函数
                    onFulfilled: (value) => { // 这个onfulfilled是属性名, value值就是在resolve中调用onfulfilled传递进来的值
                        try { //使用try catch将捕获的错误传递到onRejected中
                            onFulfilled(value) // 这个onfulfilled是函数
                        } catch (e) {
                            onRejected(e)
                        }
                    },
                    onRejected: (reason) => {
                        try {
                            onRejected(reason)
                        }catch (e) {
                            onRejected(e)
                        }
                    }
    
                })
            }
            if(this.status === MyPromise.FULFILLED) {
                setTimeout(() => {
                    try {
                        onFulfilled(this.value) //如果then()中有错误发生，则将错误信息捕获放入onRejected中
                    } catch (e) {
                        onRejected(e)
                    }
                })
            }
            if(this.status === MyPromise.REJECTED) {
                setTimeout(() => {
                    try {
                        onRejected(this.reason)
                    } catch (e) {
                        onRejected(e)
                    }
                })
            }
        }
#在promise中，以下代码应该执行的顺序为  这是最后面->此处被执行到->解决
        new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('解决')
                console.log('此处被执行到')
            })
    
        })
        .then(value => {
            console.log(value)
        },reason => {
            console.log('reason = ' + reason)
        })
        console.log('这是最后面')
##为了实现该效果，我们把callbacks变成异步执行  此时已经完成了初步的promise
     resolve(value) {
            if(this.status === MyPromise.PENDING) { // 为了保证每次只能执行一个状态的改变
                this.status = MyPromise.FULFILLED
                this.value = value // 将传递进来的值保存，以便传递给下一步then()
                // 如果异步完成后执行resolve，则调用保存的函数
                setTimeout(() => {
                    this.callBacks.map(callback =>{
                        callback.onFulfilled(this.value)
                    })
                })
            }
        }
        reject(reason) {
            if(this.status === MyPromise.PENDING) { // 为了保证每次只能执行一个状态的改变
                this.status = MyPromise.REJECTED
                this.reason = reason // 将传递进来的值保存，以便传递给下一步then()// 如果异步完成后执行rejected，则调用保存的函数
                setTimeout(() =>{
                    this.callBacks.map(callback => {
                        callback.onRejected(this.reason)
                    })
                })
            }
        }        
#promise链式操作,首先要明白一个概念，当前then中的状态不会影响下一个then中的状态
        new Promise((resolve, reject) => {
           reject('拒绝')
        })
        .then(value => {
            console.log(value)
        },reason => {
            console.log('reason = ' + reason)
            return '新的promise不会影响下一个' // 这里不会影响下一个then的状态
        })
        .then(value => {
            console.log(value) // 此处会打印出  新的promise不会影响下一个，
        }, reason => {})
##要实现链式操作，核心原理就是在then()中返回一个新的promise，并且把then中return的值拿到传给这个新的promise，因为在then()中通过return,所以我们直接执行onFulfilled或者onRejected即可拿到return中的值
    new MyPromise((resolve, reject) => {
        setTimeout(() => {
            reject('异步状态')
        })
    })
    .then(
        value =>{},
        reason => {
            console.log('reject = ' + reason)
            return '传递给下一个promise的值'
        }
    )
    .then(value => { // 要想调用then方法，则必须返回一个新的promise状态
        console.log(value)
    })
    
    
    then(onFulfilled, onRejected) {
            let promise;
            if(typeof onFulfilled !== 'function') { // 防止传递进来的不是一个函数
                onFulfilled = () => {}
            }
            if(typeof onRejected !== 'function') {
                onRejected = () => {}
            }
            if(this.status === MyPromise.PENDING) {
                promise = new MyPromise((resolve, reject) => {
                    this.callBacks.push({ // 在异步执行resolve时，先将函数保存起来，等到resolve或者reject之后再来执行该函数
                        onFulfilled: (value) => { // 这个onfulfilled是属性名, value值就是在resolve中调用onfulfilled传递进来的值
                            try {
                                let result = onFulfilled(value) // 这个onfulfilled是函数  
                                resolve(result)
                            } catch (e) {
                                onRejected(e)
                            }
                        },
                        onRejected: (reason) => {
                            try {
                                let result = onRejected(reason) // 这里可以拿到上面代码中return的值：‘传递给下一个promise的值’
                                resolve(result)
                            }catch (e) {
                                onRejected(e)
                            }
                        }
                    })
                })
            }
            if(this.status === MyPromise.FULFILLED) {
                promise = new MyPromise((resolve, reject) => {
                    setTimeout(() => { // **链式操作中,此数是异步执行的，所以返回的promise的状态是异步修改的,在下一次调用then()时，拿到的状态时pending**
                        try { //如果then()中有错误发生，则将错误信息捕获放入onRejected中
                            let result = onFulfilled(this.value) // 在then()中调用的onFulfilled或者onRejected中的return的值，即等于该函数执行完之后的值，拿到该值之后，重新resolve一下，传递给下一个promise
                            resolve(result)
                        } catch (e) {
                            onRejected(e)
                        }
                    })
                })
            }
            if(this.status === MyPromise.REJECTED) {
                promise = new MyPromise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                          let result =  onRejected(this.reason)
                          resolve(result) // 因为当前then状态不会影响下一个promise的状态，所以都是用resolve来调用新的promise
                        } catch (e) {
                            onRejected(e)
                        }
                    })
                })
            }
            console.log(promise)
            return promise // 返回一个新的promise后就可以继续调用then()
        }
#then()穿透的实现
##在promise中，当then()没有进行任何操作的时候，会将当前状态和状态值传递给下一个then()
        // 下面代码打印出来的是 ->resolve解决
        new Promise((resolve, reject) => {
            resolve('解决')
        })
        .then()
        .then(value => {
            console.log('resolve = ' + value)
            return 'resolve promise'
        },reason => {
            console.log('reject = ' + reason)
            return '新的promise'
        })
        // 下面代码打印出来的是->reject失败
         new Promise((resolve, reject) => {
             reject('失败')
         })
         .then()
         .then(value => {
             console.log('resolve = ' + value)
             return 'resolve promise'
         },reason => {
             console.log('reject = ' + reason)
             return '新的promise'
         })
        **如果有then()未执行任何操作时，则将当前状态传递给下一个then()，如果执行了操作,则下一个状态为resolve**
###如果onFulfilled和onRejected不是函数时，手动拿到上一个状态值赋值给该函数，这样可以将上一个值传递给下一个then()，实现then()的穿透。如果上一个状态为reject，且then()没有操作时，将reject传递给下一个then()。所以添加了一个标志位rejectStatus   
         then(onFulfilled, onRejected) {
             let promise;
             let rejectStatus = false // 用于标志当前then()是否未进行任何操作，且上一个状态为reject
             if(typeof onFulfilled !== 'function') { // 防止传递进来的不是一个函数
                 onFulfilled = () => this.value
             }
             if(typeof onRejected !== 'function') {
                 onRejected = () => this.reason
                 rejectStatus = true // 当没有onReject传递进来时，则置为true
             }
             if(this.status === MyPromise.PENDING) {
                 promise = new MyPromise((resolve, reject) => {
                     this.callBacks.push({ // 在异步执行resolve时，先将函数保存起来，等到resolve或者reject之后再来执行该函数
                         onFulfilled: (value) => { // 这个onfulfilled是属性名, value值就是在resolve中调用onfulfilled传递进来的值
                             try {
                                 let result = onFulfilled(value) // 这个onfulfilled是函数
                                 resolve(result)
                             } catch (e) {
                                 reject(e) // 将上一个then()中的错误信息抛给下一个then()  下面同理
                             }
                         },
                         onRejected: (reason) => {
                             try {
                                 let result = onRejected(reason)
                                 if(rejectStatus) { // 当状态为reject,且then()无操作时，则将reject状态传递给下一个then()方法。否则传递resolve()
                                     reject(result)
                                 } else {
                                     resolve(result)
                                 }
     
                             }catch (e) {
                                 reject(e)
                             }
                         }
                     })
                 })
             }
             if(this.status === MyPromise.FULFILLED) {
                 promise = new MyPromise((resolve, reject) => {
                     setTimeout(() => {
                         try { //如果then()中有错误发生，则将错误信息捕获放入onRejected中
                             let result = onFulfilled(this.value) // 在then()中调用的onFulfilled或者onRejected中的return的值，即等于该函数执行完之后的值，拿到该值之后，重新resolve一下，传递给下一个promise
                             console.log(result)
                             resolve(result)
                         } catch (e) {
                             reject(e)
                         }
                     })
                 })
             }
             if(this.status === MyPromise.REJECTED) {
                 promise = new MyPromise((resolve, reject) => {
                     setTimeout(() => {
                         try {
                           let result =  onRejected(this.reason)
                             if(rejectStatus) {
                                 reject(result)
                             } else {
                                 resolve(result) // 因为当前then状态不会影响下一个promise的状态，所以都是用resolve来调用新的promise
                             }
     
                         } catch (e) {
                             reject(e)
                         }
                     })
                 })
             }
             return promise // 返回一个新的promise后就可以继续调用then()
         }
#在promise中，then()有时候会返回一个新的promise， 在resolve或者reject中返回一个新的promise，是可以将该promise中resolve/reject的值传递下一个then()
      new Promise((resolve, reject) => {
            resolve('失败')
        })
        .then(value => {
            return new Promise((resolve, reject) => {
                reject('返回promise')
            })
        },reason => {
            console.log('reject = ' + reason)
            return '新的promise'
        })
        .then(value => {
            console.log(value)
        }, reason => {
            console.log(reason) // 此处会拿到   返回promise
        })
        
        
##实现then()中返回promise时的数据传递        
      then(onFulfilled, onRejected) {
          let promise;
          let rejectStatus = false // 用于标志当前then()是否未进行任何操作，且上一个状态为reject
          if(typeof onFulfilled !== 'function') { // 防止传递进来的不是一个函数
              onFulfilled = () => this.value
          }
          if(typeof onRejected !== 'function') {
              onRejected = () => this.reason
              rejectStatus = true // 当没有onReject传递进来时，则置为true
          }
          if(this.status === MyPromise.PENDING) {
              promise = new MyPromise((resolve, reject) => {
                  this.callBacks.push({ // 在异步执行resolve时，先将函数保存起来，等到resolve或者reject之后再来执行该函数
                      onFulfilled: (value) => { // 这个onfulfilled是属性名, value值就是在resolve中调用onfulfilled传递进来的值
                          try {
                              let result = onFulfilled(value) // 这个onfulfilled是函数 **在返回promise中，这里拿到返回的promise值**
                              if(result instanceof MyPromise) {
                                  result.then(value => {
                                      resolve(value) // **此处resolve的是我们在这里new出来的对象promise的函数,这个promise是我们将最终then()出去的结果，不是then()中返回来的这个，切勿弄乱，其他同样代码同理**
                                  }, reason => {
                                      reject(reason)
                                  })
                              } else {
                                  resolve(result)
                              }
                          } catch (e) {
                              reject(e) // 将上一个then()中的错误信息抛给下一个then()  下面同理
                          }
                      },
                      onRejected: (reason) => {
                          try {
                              let result = onRejected(reason)
                              if(result instanceof MyPromise) {
                                  result.then(value => {
                                      resolve(value)
                                  }, reason => {
                                      reject(reason)
                                  })
                              } else {
                                  if(rejectStatus) { // 当状态为reject,且then()无操作时，则将reject状态传递给下一个then()方法。否则传递resolve()
                                      reject(result)
                                  } else {
                                      resolve(result)
                                  }
                              }
                          }catch (e) {
                              reject(e)
                          }
                      }
                  })
              })
          }
          if(this.status === MyPromise.FULFILLED) {
              promise = new MyPromise((resolve, reject) => {
                  setTimeout(() => {
                      try { //如果then()中有错误发生，则将错误信息捕获放入onRejected中
                          let result = onFulfilled(this.value) // 在then()中调用的onFulfilled或者onRejected中的return的值，即等于该函数执行完之后的值，拿到该值之后，重新resolve一下，传递给下一个promise
                          if(result instanceof MyPromise) { // 判断返回的状态是否是promise
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
                  })
              })
          }
          if(this.status === MyPromise.REJECTED) {
              promise = new MyPromise((resolve, reject) => {
                  setTimeout(() => {
                      try {
                        let result =  onRejected(this.reason)
                          if (result instanceof MyPromise) {
                              result.then((value) =>{resolve(value)}, reason => {
                                  reject(reason)
                              })
                          } else {
                              if(rejectStatus) {
                                  reject(result)
                              } else {
                                  resolve(result) // 因为当前then状态不会影响下一个promise的状态，所以都是用resolve来调用新的promise
                              }
                          }
  
                      } catch (e) {
                          reject(e)
                      }
                  })
              })
          }
          return promise // 返回一个新的promise后就可以继续调用then()  返回的状态时pending  因为resolve/reject在执行时是异步的
      }

#在promise中是不允许返回自己的（返回类型约束）  此时会报错
       let mpromise = new Promise((resolve, reject) => {
            resolve('失败')
        })
        let p = mpromise.then(value => {
            return p
        })
        
##w为了对他的返回值进行约束，对于返回的值进行判断，如果等于自身，则报错 Chaining cycle detected for promise
        then(onFulfilled, onRejected) { // 每一次then()之后下一个then()状态都是pending
            let promise;
            let rejectStatus = false // 用于标志当前then()是否未进行任何操作，且上一个状态为reject
            if(typeof onFulfilled !== 'function') { // 防止传递进来的不是一个函数
                onFulfilled = () => this.value
            }
            if(typeof onRejected !== 'function') {
                onRejected = () => this.reason
                rejectStatus = true // 当没有onReject传递进来时，则置为true
            }
            if(this.status === MyPromise.PENDING) {
                promise = new MyPromise((resolve, reject) => {
                    this.callBacks.push({ // 在异步执行resolve时，先将函数保存起来，等到resolve或者reject之后再来执行该函数
                        onFulfilled: (value) => { // 这个onfulfilled是属性名, value值就是在resolve中调用onfulfilled传递进来的值
                           
                            try {
                                let result = onFulfilled(value) // 这个onfulfilled是函数 **在返回promise中，这里拿到返回的promise值**
                                 if (promise ===result) { // 不能返回本身
                                      throw new TypeError('Chaining cycle detected for promise')
                                 }
                                if(result instanceof MyPromise) {
                                    result.then(value => {
                                        resolve(value) // **此处resolve的是我们在这里new出来的对象promise的函数,这个promise是我们将最终then()出去的结果，不是then()中返回来的这个，切勿弄乱**
                                    }, reason => {
                                        reject(reason)
                                    })
                                } else {
                                    resolve(result)
                                }
                            } catch (e) {
                                reject(e) // 将上一个then()中的错误信息抛给下一个then()  下面同理
                            }
                        },
                        onRejected: (reason) => {
                            
                            try {
                                let result = onRejected(reason)
                                if (promise === result) { // 不能返回本身
                                     throw new TypeError('Chaining cycle detected for promise')
                                }
                                if(result instanceof MyPromise) {
                                    result.then(value => {
                                        resolve(value)
                                    }, reason => {
                                        reject(reason)
                                    })
                                } else {
                                    if(rejectStatus) { // 当状态为reject,且then()无操作时，则将reject状态传递给下一个then()方法。否则传递resolve()
                                        reject(result)
                                    } else {
                                        resolve(result)
                                    }
                                }
                            }catch (e) {
                                reject(e)
                            }
                        }
                    })
                })
            }
            if(this.status === MyPromise.FULFILLED) {
                promise = new MyPromise((resolve, reject) => {
                    setTimeout(() => {
                     
                        // this.parse(onFulfilled(this.value), resolve, reject)
                        try { //如果then()中有错误发生，则将错误信息捕获放入onRejected中
                            let result = onFulfilled(this.value) // 在then()中调用的onFulfilled或者onRejected中的return的值，即等于该函数执行完之后的值，拿到该值之后，重新resolve一下，传递给下一个promise
                            if (promise === result) { // 不能返回本身
                                 throw new TypeError('Chaining cycle detected for promise')
                            }
                            if(result instanceof MyPromise) { // 判断返回的状态是否是promise
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
                    })
                })
            }
            if(this.status === MyPromise.REJECTED) {
                promise = new MyPromise((resolve, reject) => {
                    setTimeout(() => { // 因为then()是微任务，所以加了延时器
                        try {
                          let result =  onRejected(this.reason)
                           if (promise === result) { // 不能返回本身
                                throw new TypeError('Chaining cycle detected for promise')
                           }
                            if (result instanceof MyPromise) {
                                result.then((value) =>{resolve(value)}, reason => {
                                    reject(reason)
                                })
                            } else {
                                if(rejectStatus) {
                                    reject(result)
                                } else {
                                    resolve(result) // 因为当前then状态不会影响下一个promise的状态，所以都是用resolve来调用新的promise
                                }
                            }
    
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
            }
            return promise // 返回一个新的promise后就可以继续调用then()  返回的状态时pending  因为resolve/reject在执行时是异步的
        }
#promise静态方法的实现   核心原理还是只有promise才能调用then()方法,且promise的状态只能被更改一次
        
      catch(onRejected) {
        return this.then(null, onRejected)
      }
       static resolve(value) {
            return new MyPromise((resolve, reject) => {
                if(value instanceof MyPromise) { // 如果调用静态方法resolve时值为新的promise
                    if(value instanceof MyPromise) { // 判断返回的状态是否是promise
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
                        if(resolves.length === promises.length) {
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
