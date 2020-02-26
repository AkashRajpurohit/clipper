class Clipper extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [],
            interval: -1
        }
    }

    loadHistory = () => {
        // Get all history from localstorage
        const historyFromLocalstorage = JSON.parse(window.localStorage.getItem('clipper')) || []

        return historyFromLocalstorage
    }

    addHistoryToLocalstorage = (text) => {
        const historyFromLocalstorage = JSON.parse(window.localStorage.getItem('clipper')) || []

        // Add new text to localstorage
        historyFromLocalstorage.push(text)

        // Save updated history to localstorage
        window.localStorage.setItem('clipper', JSON.stringify(historyFromLocalstorage))
    }

    textClicked = (e) => {
        window.copyToClipboard(e.currentTarget.dataset.text)
    }

    componentWillMount() {
        // Get All previously added histories
        this.state.history = this.loadHistory()

        // Start listening for new texts
        this.state.interval = setInterval(() => {
            const text = window.checkClipboard()

            // Check is last added text is same as new text or not
            if(this.state.history[this.state.history.length - 1] !== text) {
                // Add this text to history
                this.setState({ history: [ ...this.state.history, text ]})
                this.addHistoryToLocalstorage(text)
            }
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.state.interval)
    }

    render() {
        return (
            <div>
                <h1>Clipper! 📋</h1>
                <p>{this.state.history.length}</p>
                <ul>
                    {
                        this.state.history.map(text => {
                            return (
                                <li data-text={text} key={text} onClick={this.textClicked}>
                                    {text}
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        );
    }
}

ReactDOM.render(
    <Clipper />,
    document.getElementById('root')
)
