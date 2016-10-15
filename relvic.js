'use struct';

HTMLElement.prototype.render = function(element) {
    //Relvic.lastid -= 1;
    //element.setAttribute('relvic-id', this.getAttribute('relvic-id'));
    this.outerHTML = element.outerHTML;
}

var Relvic = {
    version: '0.0.1-dev',
    __classes: new Array(),
    __current_root: undefined,
    onrender: new Array(),
    lastid: -1,
    nextid: () => {
        Relvic.lastid += 1;
        return Relvic.lastid;
    },
    getRelvicId: (id) => {
        return document.querySelector(`[relvic-id='${id}']`);
    },
    createElement: (tag, props, ...childrens) => {
        switch (typeof tag) {
            case 'string':
                {
                    let el = document.createElement(tag);
                    if (props != null)
                        Object.keys(props).forEach(function(prop) {
                            switch (prop) {
                                case 'handleInput':
                                    {
                                        let id = el.getAttribute('relvic-id');
                                        if (id == undefined) {
                                            id = Relvic.nextid();
                                            el.setAttribute('relvic-id', id);
                                        }
                                        Relvic.onrender.push(
                                            function() {
                                                Relvic.getRelvicId(id).addEventListener('input', props[prop]);
                                            }
                                        );
                                        break;
                                    }
                                default:
                                    {
                                        el.setAttribute(prop, props[prop]);
                                    }
                            }
                        });
                    Relvic.__current_root = el;
                    childrens.forEach(function(child) {
                        if (typeof child == 'string') el.appendChild(document.createTextNode(child));
                        else if (Array.isArray(child))
                            child.forEach(function(c) {
                                el.appendChild(c);
                            });
                        else if (child.item !== undefined) {
                            child.forEach(function(c, a, k) {
                                el.appendChild(child.item(k));
                            });
                        } else el.appendChild(child);
                    });
                    return el;
                }
            case 'object':
                {
                    if (props !== undefined)
                        tag.props = props;
                    Relvic.__current_root = tag;
                    tag.childrens = childrens;
                    let el = tag.render();
                    if (tag.componentDidMount !== undefined && tag.timer === undefined)
                        tag.componentDidMount();
                    let id = Relvic.nextid();
                    if (typeof el == 'string') {
                        let tmp = document.createElement('div');
                        tmp.innerHTML = el;
                        el = tmp.childNodes[0];
                    }
                    el.setAttribute('relvic-id', id);
                    tag.HTMLElements.push(id);
                    return el;
                }
        }
    },
    createClass: (obj) => {
        Relvic.__current_root = obj;
        if (obj.getInitialState !== undefined)
            obj.state = obj.getInitialState();
        obj.setState = function(state) {
            this.state = state;
            let self = this;
            /*this.HTMLElements.forEach(function(key) {
                try {
                    Relvic.getRelvicId(key).render(Relvic.createElement(self));
                } catch (error) {
                    self.HTMLElements[key] = undefined;
                }
            });*/
        }
        obj.HTMLElements = new Array();
        Relvic.__classes.push(obj);
        return Relvic.__classes[Relvic.__classes.length - 1];
    },
    createTemplate: function(template, ...values) {
        let ret = document.createElement('div');
        template.raw.forEach(function(rawStr, k) {
            ret.appendChild(document.createTextNode(rawStr));
            if (values[k] !== undefined) {
                let el = document.createElement('span');
                el.setAttribute('relvic-id', Relvic.nextid());
                el.textContent = values[k];
                ret.appendChild(el);
            }
        });
        return ret.childNodes;
    },
    render: (element, root) => {
        if (typeof element == 'string') root.innerHTML = element;
        else root.innerHTML = element.outerHTML;
        Relvic.onrender.forEach(function(item) {
            item();
        });
    }
};