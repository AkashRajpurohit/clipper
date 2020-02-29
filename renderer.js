const successAudio = new Audio('./assets/sound/success.mp3')
const errorAudio = new Audio('./assets/sound/error.mp3')
const trashAudio = new Audio('./assets/sound/trash.mp3')
const storageLimit = 20
const maxCharsThatCanBeCopied = 500

class Clipper extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [],
      interval: -1,
      showStorageExceedToast: false,
      enableAudio: true
    }
  }

  playSuccessAudio = () => {
    if(this.state.enableAudio) {
      successAudio.currentTime = 0
      successAudio.play()
    }
  }

  playErrorAudio = () => {
    if(this.state.enableAudio) {
      errorAudio.currentTime = 0
      errorAudio.play()
    }
  }

  playTrashAudio = () => {
    if(this.state.enableAudio) {
      trashAudio.currentTime = 0
      trashAudio.play()
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

  setLastCopiedText = (text) => window.localStorage.setItem('clipper:last-copied', text)

  getLastCopiedText = () => window.localStorage.getItem('clipper:last-copied')

  startClipboardWatch = () => {
    // Start listening for new texts
    this.state.interval = setInterval(() => {
      const text = window.checkClipboard().trim()

      // Don't process for empty string
      if (text.trim() === "") {
        return
      }

      // Check if showStorageExceedToast is set to true or not
      if (this.state.showStorageExceedToast) {
        // Play error audio
        this.playErrorAudio()

        // Open the main window if its is closed
        window.openMainWindow()

        M.toast({ html: 'Your storage limit is exceeded!' })

        // reset it to false so that it doesn't repeat again and again
        this.setState({ showStorageExceedToast: false })

        return
      }

      // Don't show notification if the same text is being copied
      if (this.getLastCopiedText() === text) {
        return
      }

      // Sync with last copied text in storage
      this.setLastCopiedText(text)

      // Block copying of text which has chars more than maxCharsSpecified
      if(text.trim().length > maxCharsThatCanBeCopied) {
        // Play error audio
        this.playErrorAudio()

        // Open the main window if its is closed
        window.openMainWindow()

        M.toast({ html: `Cannot copy text of characters more than ${maxCharsThatCanBeCopied}` })

        return
      }

      // Limit the max storage limit
      if (this.state.history.length >= storageLimit) {
        // Set the toast condition to true so that
        // it triggers the condition above in next interval
        this.setState({ showStorageExceedToast: true })
        return
      }

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
        }, () => {
          // Sync with storage
          this.updateLocalstorage()
        })

        this.playSuccessAudio()
      }
    }, 500)
  }

  componentWillMount() {
    // Get All previously added histories
    this.state.history = this.loadHistory()

    // Start the watcher
    this.startClipboardWatch()
  }

  componentWillUnmount() {
    // Clear the interval
    clearInterval(this.state.interval)
  }

  handleTextClick = (e) => {
    // Clear the last copied text to avoid conflicts
    window.localStorage.removeItem('clipper:last-copied')

    const { text } = e.currentTarget.dataset

    const remainingHistory = this.state.history.filter(item => item.text !== text)

    // Update the state with remaining texts
    this.setState({
      history: [
        ...remainingHistory
      ]
    }, () => {
      this.updateLocalstorage()
    })

    window.copyToClipboard(e.currentTarget.dataset.text)
  }

  handleDeleteSingleText = (e, id) => {
    // Stop event propagation to the main li tag
    e.stopPropagation()

    const remainingHistory = this.state.history.filter(item => item.id !== id)

    // Update the state with remaining texts
    this.setState({
      history: [
        ...remainingHistory
      ]
    }, () => {
      this.updateLocalstorage()
    })

  }

  handleFooterClick = () => {
    window.openExternalUrl('https://akashwho.codes')
  }

  handleModalClick = () => {
    const elem = document.querySelector('#settings-modal')
    const instance = M.Modal.init(elem)
    instance.open()
  }

  handleAudioSwitch = () => {
    this.setState((prevState) => ({ enableAudio: !prevState.enableAudio }))
  }

  handleClearStorage = () => {
    // Play trash audio
    this.playTrashAudio()
    
    // Reset the state
    this.setState({ history: [] }, () => {

      // Reset the storage
      this.updateLocalstorage()
    })

    // Remove the contents from clipboard
    window.clearClipboard()

    // Clear the last copied text to avoid conflicts
    window.localStorage.removeItem('clipper:last-copied')
  }

  render() {
    return (
      <div className="container m-tb">
        <h1 className="center-align">Clipper! 📋</h1>
        <div className="information">
          <span onClick={this.handleClearStorage} className="waves-effect waves-light red darken-4 btn"><i class="material-icons right">delete_forever</i>Clear</span>
          <span onClick={this.handleModalClick} className="waves-effect waves-light modal-trigger btn" ><i className="material-icons">settings</i></span>
          <h6>Storage Limit: <b>{this.state.history.length} / {storageLimit}</b></h6>
        </div>
        {this.state.history.length > 0
          ? <ul className="collection no-border clickable">
            {
              this.state.history.map(({ id, text }) => {
                return (
                  <div className="collection-item__div">
                    <li key={id} data-text={text} className="collection-item hoverable m-tb" onClick={this.handleTextClick}><div>{text}</div></li>
                    <div className="collection-item__options">
                      <a onClick={(e) => this.handleDeleteSingleText(e, id)} className="secondary-content red-text text-darken-3"><i class="material-icons">delete</i></a>
                    </div>
                  </div>
                )
              })
            }
          </ul>
          : <div className="center-align m-tb30">
            <img height="200" width="200" src="./assets/no_data.svg" alt="no data" />
          </div>}

          <div id="settings-modal" className="modal bottom-sheet">
            <div className="modal-content">
              <h4>Settings</h4>
              <div className="switch">
                <span>Enable Audio</span>&nbsp;&nbsp;
                <label>
                  <input type="checkbox" checked={this.state.enableAudio} onChange={this.handleAudioSwitch}  />
                  <span className="lever"></span>
                </label>
              </div>
              <br />
              <br />
              <div className="divider"></div>
                <p><b>Note: </b>You can save text of maximum {maxCharsThatCanBeCopied} characters only.</p>
            </div>
            <div className="modal-footer">
              <a href="#!" className="modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
          </div>
        <div className="footer-copyright">
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