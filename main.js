function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    walk: function (data) {
        var self = this;
        //遍历对象，获得对象所有属性的监听
        Object.keys(data).forEach(function (key) {
            self.defineReactive(data, key, data[key]);
        });
    },
    defineReactive: function (data, key, val) {
        var dep = new Dep();
        // 递归遍历所有子属性
        var childObj = observe(val);
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function getter() {
                if (Dep.target) {
                    // 在这里添加一个订阅者，有关Dep.target的获得，会在watcher中实现
                    dep.addSub(Dep.target);
                }
                return val;
            },
            // setter，如果对一个对象属性值改变，就会触发setter中的dep.notify(),通知watcher（订阅者）数据变更，执行对应订阅者的更新函数，来更新视图。
            set: function setter(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                // 新的值是object的话，进行监听
                childObj = observe(newVal);
                dep.notify();
            }
        });
    }
};

function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
};

// 消息订阅器Dep，订阅器Dep主要负责收集订阅者，然后在属性变化的时候执行对应订阅者的更新函数
function Dep() {
    this.subs = [];
}

Dep.prototype = {
    /**
     * [订阅器添加订阅者]
     * @param  {[Watcher]} sub [订阅者]
     */
    addSub: function (sub) {
        this.subs.push(sub);
    },
    // 通知订阅者数据变更
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update();
        });
    }
};
Dep.target = null;

function Watcher(vm, exp, cb) {
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    this.value = this.get();  // 将自己添加到订阅器的操作


}

Watcher.prototype = {
    update: function () {
        this.run();
    },
    run: function () {
        var value = this.vm.data[this.exp];
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    },
    get: function () {
        console.log('93',this.vm)
        Dep.target = this;  // 缓存自己
        var value = this.vm.data[this.exp]  // 强制执行监听器里的get函数

        Dep.target = null;  // 释放自己
        return value;
    }
};


function SelfVue(data, el, exp) {
    console.log('----', data);
    this.data = data;
    observe(data);
    el.renderData = this.data[exp];  // 初始化模板数据的值
    console.log(this)
    new Watcher(this, exp, function (value, oldv) {
        console.log('--oldv', oldv, '--newv', value)
        el.renderData = value;
    });
    return this;
}

let ele = {
    renderData: 0
}
var selfVue = new SelfVue({
    name: 'hello world'
}, ele, 'name');

setTimeout(function () {
    console.log('name值改变了');
    selfVue.data.name = 'canfoo';
}, 2000);

setTimeout(() => {
    console.log(ele.renderData)
}, 9000)

class MyObserver {
    constructor(data) {
        this.data = data;
        this.walk(data);
    }
    walk(data) {
        Object.keys(data).forEach((key)=>{
            this.defineReactive(data,key,data[key])
        })
    }
    defineReactive(data, key, val) {
        const dep = new MyDep()
        myObserve(val)
        Object.defineProperty(data, key, {
            get() {
                if (MyDep.target) {
                    dep.addSub(MyDep.target)
                }
                return val
            },
            set(newVal) {
                if (newVal === val) return;
                val = newVal;
                myObserve(newVal)
                dep.notify()
            }
        })

    }
}

function myObserve(obj) {
    if (!obj || typeof obj !== 'object') return;
    return new MyObserver(obj)

}
class MyDep {
    constructor() {
        this.subscribers = []
    }
    addSub(subscriber) {
        this.subscribers.push(subscriber)
    }
    notify() {
        this.subscribers.forEach((subscriber) => {
            subscriber.update()
        })
    }
}

MyDep.target = null

class MyWatcher {
    constructor(vm, exp, cb) {
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        this.value = this.get()
    }
    get() {
        MyDep.target=this;
        var value=this.vm.data[this.exp]
        MyDep.target=null;
        return value
    }
    run(){
        let value=this.vm.data[this.exp]
        var oldValue=this.value
        if (value!==oldValue){
            this.value=value
            this.cb.call(this.vm,value,oldValue)
        }
    }
    update(){
        this.run()
    }

}





