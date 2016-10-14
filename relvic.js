'use struct';

var Relvic = {
    createClass: function(obj) {
        obj.state = {};
        if (obj.getInitialState !== undefined)
            obj.state = obj.getInitialState();
        obj.__state = obj.state;
        obj.binded = [];
        if (obj.render === undefined)
            console.error(`Error: Can't create class without "render" function.`);
        return obj;
    },
    render: function(tag, root = undefined) {
        if (root === undefined)
            return window[tag].render();
        let tmp = document.createElement('div');
        root.innerHTML = window[tag].render();
        let el = tmp.childNodes[0];
        root.querySelectorAll('[click]').forEach(function(item) {
            item.addEventListener('click', function() {
                window[tag][item.getAttribute('click')]();
            });
        });
        Object.keys(window[tag].state).forEach(function(key) {
            document.querySelectorAll(`[bind-value='${key}']`).forEach(function(e) {
                window[tag].binded.push(e);
                e.addEventListener('input', function() {
                    window[tag].binded.forEach(function(q) {
                        if (q === e) return;
                        q.value = e.value;
                    });
                });
            });
            Object.defineProperty(window[tag].state, key, {
                get: function() {
                    return window[tag].__state[key];
                },
                set: function(newValue) {
                    window[tag].binded.forEach(function(q) {
                        q.value = newValue;
                    });
                },
                configurable: true
            });
        });
    }
};