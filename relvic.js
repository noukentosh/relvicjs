'use struct';

HTMLElement.prototype.render = function(element) {
    //Relvic.lastid -= 1;
    //element.setAttribute('relvic-id', this.getAttribute('relvic-id'));
    this.outerHTML = element.outerHTML;
}

var Relvic = {
    lastid: -1,
    nextid: function() {
        this.lastid += 1;
        return this.lastid;
    },
    getRelvicId: function(id) {
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
                                        el.addEventListener('input', tag[props[prop]]);
                                        break;
                                    }
                                default:
                                    {
                                        el.setAttribute(prop, props[prop]);
                                    }
                            }
                        });
                    childrens.forEach(function(child) {
                        if (typeof child == 'string') el.appendChild(document.createTextNode(child));
                        else if (Array.isArray(child))
                            child.forEach(function(c) {
                                el.appendChild(c);
                            });
                        else el.appendChild(child);
                    });
                    return el;
                }
            case 'object':
                {
                    if (props !== undefined)
                        tag.props = props;
                    tag.childrens = childrens;
                    let el = tag.render();
                    if (tag.componentDidMount !== undefined && tag.timer === undefined)
                        tag.componentDidMount();
                    let id = Relvic.nextid();
                    el.setAttribute('relvic-id', id);
                    tag.HTMLElements.push(id);
                    return el;
                }
        }
    },
    createClass: (obj) => {
        if (obj.getInitialState !== undefined)
            obj.state = obj.getInitialState();
        obj.setState = function(state) {
            this.state = state;
            let self = this;
            this.HTMLElements.forEach(function(key) {
                try {
                    Relvic.getRelvicId(key).render(Relvic.createElement(self));
                } catch (error) {
                    self.HTMLElements[key] = undefined;
                }
            });
        }
        obj.HTMLElements = new Array();
        return obj;
    },
    render: (element, root) => {
        if (typeof element == 'string') root.innerHTML = element;
        else root.innerHTML = element.outerHTML;
    }
};