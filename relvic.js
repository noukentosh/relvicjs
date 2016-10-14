'use struct';

var Relvic = {
    createClass: function(obj) {
        obj.state = {};
        if (obj.getInitialState !== undefined)
            obj.state = obj.getInitialState();
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
        root.querySelectorAll('[bind-value]').forEach(function(item) {
            item.addEventListener('change', function() {
                window[tag].state[item.getAttribute('bind-value')] = item.value;
                Relvic.render(tag, root);
            });
        });
    }
};