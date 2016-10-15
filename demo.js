console.time('demo');
var data = [
    { id: 1, author: "Pete Hunt", text: "This is one comment" },
    { id: 2, author: "Jordan Walke", text: "This is *another* comment" }
];

var Comment = Relvic.createClass({
    render: function() {
        return (
            Relvic.createElement('div', { class: "comment" },
                Relvic.createElement('h2', { class: "commentAuthor" }, `${this.props.author}`),
                `${this.childrens}`
            )
        );
    }
});

var CommentList = Relvic.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment) {
            return (
                Relvic.createElement(Comment, { author: comment.author, key: comment.id }, comment.text)
            );
        });
        return (
            Relvic.createElement('div', { class: "commentList" },
                commentNodes
            )
        );
    }
});

var CommentForm = Relvic.createClass({
    getInitialState: function() {
        return { author: "Test" };
    },
    handleInput: function(e) {
        this.setState({ author: e.target.value });
    },
    render: function() {
        return (
            Relvic.createElement('div', { class: "commentForm" }, Relvic.createTemplate `Hello ${this.state.author}`, Relvic.createElement('input', { handleInput: this.handleInput.bind(this) }))
        );
    }
});

var CommentBox = Relvic.createClass({
    getInitialState: function() {
        return { data };
    },
    render: function() {
        return (
            Relvic.createElement('div', { class: "commentBox" },
                Relvic.createElement('h1', null, "Comments"),
                Relvic.createElement(CommentList, { data: this.state.data }),
                Relvic.createElement(CommentForm),
                Relvic.createElement('button', null, "Click me")
            )
        );
    }
});

Relvic.render(Relvic.createElement(CommentBox), document.getElementById('root'));
console.timeEnd('demo');