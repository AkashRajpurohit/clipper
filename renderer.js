const audio = new Audio('./assets/sound/beep.mp3')

class Clipper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [],
      interval: -1
    }
  }

  getNewItemId = () => {
    if (this.state.history.length === 0) return 1

    return this.state.history[0].id + 1
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
      const text = window.checkClipboard().trim()

      // Don't process for empty string
      if(text.trim() === "") return

      // Check if this text is already in the clipboard history
      const isAlreadyInHistory = this.state.history
        .findIndex(({ text: historyText }) => historyText === text) !== -1

      // Check the condition
      if (this.state.history.length === 0 || !isAlreadyInHistory) {
        // Add this text to history
        this.setState({
          history: [{
            id: this.getNewItemId(),
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
        <div className="information">
          <span className="waves-effect waves-light red darken-4 btn"><i class="material-icons right">delete_forever</i>Clear</span>
          <h6>Storage Limit: {this.state.history.length} / 100</h6>
        </div>
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
          © { 
            new Date().getFullYear() == "2020" 
              ? "2020" 
              : "2020 - " + new Date().getFullYear() 
            } • Clipper
          <span className="black-text text-darken-4 right clickable" onClick={this.handleFooterClick}>With 💖 Akash Rajpurohit</span>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Clipper />,
  document.getElementById('root')
)
