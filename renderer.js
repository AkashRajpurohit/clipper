const audio = new Audio('./assets/sound/beep.mp3')

class Clipper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [],
      interval: -1
    }
  }

  getNewItemId = (array) => {
    if (array.length === 0) return 1

    return array[0].id + 1
  }

  loadHistory = () => {
    // Get all history from localstorage
    const historyFromLocalstorage = JSON.parse(window.localStorage.getItem('clipper')) || []

    return historyFromLocalstorage
  }

  updateLocalstorage = () => {
    // Clear the exisitng histories
    window.localStorage.removeItem('clipper')
    // Update with new history data
    window.localStorage.setItem('clipper', JSON.stringify(this.state.history))
  }

  textClicked = (e) => {
    const { text } = e.currentTarget.dataset

    let remainingHistory = this.state.history.filter(item => item.text !== text)

    this.setState({
      history: [
        ...remainingHistory
      ]
    })

    window.copyToClipboard(e.currentTarget.dataset.text)
  }

  componentWillMount() {
    // Get All previously added histories
    this.state.history = this.loadHistory()

    // Start listening for new texts
    this.state.interval = setInterval(() => {
      const text = window.checkClipboard()

      // Check is first text is same as new text or not
      if (this.state.history.length === 0 || this.state.history[0].text !== text) {
        // Add this text to history
        this.setState({
          history: [{
            id: this.getNewItemId(this.state.history),
            text
          },
          ...this.state.history]
        })

        this.updateLocalstorage()

        audio.currentTime = 0
        audio.play()
      }
    }, 1000)
  }

  componentWillUnmount() {
    // Clear the interval
    clearInterval(this.state.interval)
  }

  handleFooterClick = () => {
    window.openExternalUrl('https://akashwho.codes')
  }

  render() {
    return (
      <div className="container m-tb">
        <h1 className="center-align">Clipper! 📋</h1>
        <ul className="collection no-border">
          {
            this.state.history.map(({ id, text }) => {
              return (
                <li className="collection-item hoverable clickable m-tb" data-text={text} key={id} onClick={this.textClicked}>
                  {text}
                </li>
              )
            })
          }
        </ul>
        <div className="footer-copyright p-tb">
          <div className="container">
          © { new Date().getFullYear() } Clipper
          <span className="black-text text-darken-4 right clickable" onClick={this.handleFooterClick}>Akash Rajpurohit</span>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Clipper />,
  document.getElementById('root')
)
