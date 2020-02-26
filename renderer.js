const Clipper = () => {
    const [clipboard, setClipboard] = React.useState([])

    React.useEffect(() => {
        // Get mock data for now
        // TODO: Bring data from localstorage

        setClipboard(["Hello", "World"])
    }, [])
    return (
        <div>
            <h1>Clipper! 📋</h1>

            <ul>
                {clipboard.map(text => {
                    return (<li key={text}>{text}</li>)
                })}
            </ul>
        </div>
    );
}

ReactDOM.render(
    <Clipper />,
    document.getElementById('root')
)
