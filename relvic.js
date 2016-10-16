'use struct';

class RelvicComponent {
    constructor(obj) {
        let self = this;
        this.render = undefined;
        Object.keys(obj).forEach(function(key) {
            self[key] = obj[key];
        });
        if (this.getInitialState !== undefined)
            this.state = this.getInitialState();
        this.HTMLElements = new Array();
        this.onchangestate = new Array();
        Relvic.__current_root = this;
    }
    setState(state) {
        let self = this;
        Object.keys(state).forEach(function(key) {
            self.state[key] = state[key];
        });
        this.onchangestate.forEach(function(el) {
            el.template.finish = el.template.raw;
            el.template.varnames.forEach(function(v) {
                el.template.finish = el.template.finish.replace(`{{${v}}}`, eval(v.replace('this', 'self')));
            });
            Relvic.getElementById(el.id).textContent = el.template.finish;
        });
    }
}

class RelvicProto {
    constructor() {
        this.version = '0.0.1-dev';
        this.__current_root = undefined;
        this.onrender = new Array();
        this.lastid = -1;
    }
    get nextid() {
        this.lastid += 1;
        return this.lastid;
    }
    set nextid(val) {
        console.log(new Error("You can't set `nextid`"));
    }
    getElementById(id) {
        return document.querySelector(`[relvic-id='${id}']`);
    }
    handleEvent(el, event, fn) {
        let id = el.getAttribute('relvic-id');
        if (id == undefined) {
            id = this.nextid;
            el.setAttribute('relvic-id', id);
        }
        this.onrender.push(
            function() {
                Relvic.getElementById(id).addEventListener(event, fn);
            }
        );
    }
    createElement(tag, props, ...childrens) {
        switch (typeof tag) {
            case 'string':
                {
                    let el = document.createElement(tag);
                    if (props != null)
                        Object.keys(props).forEach(function(prop) {
                            switch (prop) {
                                case 'handleInput':
                                    {
                                        Relvic.handleEvent(el, 'input', props[prop]);
                                        break;
                                    }
                                case 'handleClick':
                                    {
                                        Relvic.handleEvent(el, 'click', props[prop]);
                                        break;
                                    }
                                default:
                                    {
                                        el.setAttribute(prop, props[prop]);
                                    }
                            }
                        });
                    this.__current_root = el;
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
                    this.__current_root = tag;
                    tag.childrens = childrens;
                    let el = tag.render();
                    if (tag.componentDidMount !== undefined && tag.timer === undefined)
                        tag.componentDidMount();
                    let id = this.nextid;
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
    }
    createTemplate(template) {
        template = {
            raw: template,
            varnames: template.match(/({{)+\S+(}})/g).map(function(varname) {
                return varname.substring(2, varname.length - 2);
            }),
            finish: template
        };
        template.varnames.forEach(function(v) {
            template.finish = template.finish.replace(`{{${v}}}`, eval(v.replace('this', 'Relvic.__current_root')));
        });
        let ret = document.createElement('span');
        let id = this.nextid;
        ret.setAttribute('relvic-id', id);
        ret.textContent = template.finish;
        this.__current_root.onchangestate.push({
            id,
            template
        });
        return ret;
    }
    createClass(obj) {
        return new RelvicComponent(obj);
    }
    render(element, root) {
        if (typeof element == 'string') root.innerHTML = element;
        else root.innerHTML = element.outerHTML;
        this.onrender.forEach(function(item) {
            item();
        });
    }
}

var Relvic = new RelvicProto();