import {createMuiTheme, makeStyles, ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline'
import red from "@material-ui/core/colors/red";

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: red[900]
    },
    secondary: {
      main: '#ec407a'
    }
  }
})

export function Scaffold({playlist, children}) {
  return <html lang="en">
  <ThemeProvider theme={theme}>
    <head>
      <title>{playlist.name} - musicorum</title>
      <meta name="description" content={playlist.description}/>
      <meta name="theme-color" content="#b71c1c"/>
      <meta property="og:type" content="website"/>
      <meta property="og:site_name" content="Musicorum Playlists"/>
      <meta property="og:title" content={playlist.name}/>
      <meta name="og:description" content={playlist.description}/>
      <meta property="og:image" itemprop="image" content={playlist.image + '?tr=w-500,h-500'}/>
      <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"/>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
    </head>
    <body>
    <CssBaseline/>
    {children}
    </body>
  </ThemeProvider>
  </html>
}
