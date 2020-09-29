import Head from 'next/head'
import {useRouter} from "next/router";
import fetch from 'node-fetch'
import {Scaffold} from "../components/Scaffold";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItem from "@material-ui/core/ListItem";
import Link from "@material-ui/core/Link";
import Icon from "@material-ui/core/Icon";
import moment from 'moment'

import texts from '../assets/texts.json'
import Button from "@material-ui/core/Button";
import React, {useState} from "react";
import Box from "@material-ui/core/Box";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import useTheme from "@material-ui/core/styles/useTheme";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";

import DeezerLogo from '../assets/logos/deezer.svg'
import SpotifyLogo from '../assets/logos/spotify.svg'
import TestPresentationLogo from '../assets/logos/test-presentation.svg'
import {API_URL} from '../vars.js'
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles({
  topHeader: {
    display: 'flex',
    alignContent: 'space-between'
  },
  texts: {
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between'
  },
  image: {
    borderRadius: 4,
    width: 170,
    boxShadow: '0 0 13px 1px #00000026',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: '0 0 13px 5px #73737326',
    }
  },
  smallImage: {
    borderRadius: 4,
    maxWidth: 280,
    boxShadow: '0 0 13px 1px #00000026',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: '0 0 13px 5px #73737326',
    }
  },
  avatar: {
    width: 60,
    height: 60,
    boxShadow: '1px 1px 3px 0px #00000042',
    marginRight: 10,
    transition: 'box-shadow 0.4s',
    '&:hover': {
      boxShadow: '1px 1px 9px 0px #00000042'
    }
  },
  smallAvatar: {
    width: 44,
    height: 44,
    boxShadow: '1px 1px 3px 0px #00000042',
    marginRight: 3,
    transition: 'box-shadow 0.4s',
    '&:hover': {
      boxShadow: '1px 1px 9px 0px #00000042'
    }
  },
  fullWidth: {
    width: '100%'
  },
  items: {
    marginTop: 20
  },
  banner: {
    width: '100%',
    background: '#ec407a',
  },
  noWrap: {
    flexWrap: 'nowrap'
  },
  smallItem: {
    paddingLeft: '0px',
    paddingBottom: '0px'
  },
  serviceLogo: {
    background: 'transparent',
    width: 32,
    height: 32
  },
  link: {
    fontSize: 20
  }
});

const trackTypes = ['TOP_TRACK', 'LOVED_TRACK']

const SPOTIFY_API = 'https://api.spotify.com/v1'
const DEEZER_API = 'https://api.deezer.com'

export default function Playlist({playlist}) {
  const classes = useStyles()
  const router = useRouter()
  const theme = useTheme()
  const smallSize = !useMediaQuery('(min-width:700px)');
  console.log(playlist)
  const [openDialog, setOpenDialog] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [playlistId, setPlaylistId] = useState(null)

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  if (playlist && playlist.error) {
    if (playlist.error.error === 'NOT_FOUND') {
      return <h1>Not found.</h1>
    } else {
      return <h1>Unexpected error.</h1>
    }
  }

  const createPlaylist = async () => {
    setLoading(true)
    if (userData.service === 'spotify') createSpotifyPlaylist()
    else createDeezerPlaylist()
  }

  const createSpotifyPlaylist = async () => {
    try {
      const {user, token} = userData
      const spotifyPlaylist = await fetch(`${SPOTIFY_API}/users/${user.id}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: playlist.name,
          description: `${playlist.serviceDescription}`
        })
      }).then(r => r.json())
      console.log(spotifyPlaylist)
      const id = spotifyPlaylist.id
      // const id = "78u6RIi6wPqsS3yfkIjCb6"

      const imData = await fetch(playlist.image).then(r => r.blob())
      console.log(imData)
      const p = new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsDataURL(imData)
        reader.onloadend = () => resolve(reader.result)
      })

      const photo = await fetch(`${SPOTIFY_API}/playlists/${id}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
          'Authorization': `Bearer ${token}`
        },
        body: (await p).replace('data:image/jpeg;base64,', '')
      })
      console.log(photo)
      if (photo.status !== 202) throw new Error(await photo.json())

      const addItemsReq = await fetch(`${SPOTIFY_API}/playlists/${id}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uris: playlist.items.filter(({spotifyId}) => !!spotifyId).map(({spotifyId}) => `spotify:track:${spotifyId}`)
        })
      }).then(r => r.json())

      console.log(addItemsReq)

      setLoading(false)
      setPlaylistId(id)
    } catch (e) {
      console.error(e)
    }
  }

  const createDeezerPlaylist = async () => {
    try {
      const {user, token} = userData
      const deezerPlaylist = await fetch(`${API_URL}/playlists/deezer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(playlist)
      }).then(r => r.json())
      console.log(deezerPlaylist)
      const id = deezerPlaylist.id

      setLoading(false)
      setPlaylistId(id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSpotify = async () => {
    const {url} = await fetch(`${API_URL}/auth/spotify`).then(r => r.json())
    window.connect = ({token, user}) => {
      setUserData({
        service: 'spotify',
        user: {
          username: user.id,
          id: user.id,
          name: user.display_name,
          image: user.images[0].url
        },
        token
      })
    }
    window.open(url, 'popup', 'width=400, height=600')
  }

  const handleDeezer = async () => {
    const {url} = await fetch(`${API_URL}/auth/deezer`).then(r => r.json())
    window.connect = ({token, user}) => {
      setUserData({
        service: 'deezer',
        user: {
          username: user.name,
          id: user.id,
          name: user.firstname + ' ' + user.lastname,
          image: user.picture_medium
        },
        token
      })
    }
    window.open(url, 'popup', 'width=400, height=600')
  }

  return (
    <Scaffold playlist={playlist}>
      <Container maxWidth="md">
        <Card variant="outlined">
          {
            !!playlist.presentation ? (
              <div className={classes.banner}>
                <TestPresentationLogo />
              </div>
            ) : ''
          }
          <CardContent>
            <div className={smallSize ? {} : classes.topHeader}>
              {
                smallSize ? <>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container justify="center">
                        <Grid item>
                          <img src={playlist.image} className={classes.smallImage}/>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item className={classes.texts} xs={12}>
                      <div>
                        <Box mb={1}>
                          <Typography variant="h5" component="h2">
                            {playlist.name}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" component="span" color="textSecondary">
                          created for{' '}
                          <Link color="secondary" target="_blank"
                                href={`https://www.last.fm/user/${playlist.user}`}>{playlist.user}</Link>
                          {' '}on {' ' + moment(playlist.createdAt).format("dddd, MMMM Do YYYY")}
                        </Typography>
                        <Box mt={3} mb={3}>
                          <Typography variant="body1" component="span" color="textSecondary">
                            {playlist.description}
                          </Typography>
                        </Box>
                        {
                          trackTypes.includes(playlist.type) ? <Box>
                            <Grid container justify="center">
                              <Grid item xs={10} sm={8}>
                                <Button startIcon={<Icon>add</Icon>}
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => {
                                          setPlaylistId(null)
                                          setUserData(null)
                                          setLoading(false)
                                          setOpenDialog(true)
                                        }}
                                        fullWidth
                                        disableElevation
                                >
                                  Save
                                </Button>
                              </Grid>
                            </Grid>
                          </Box> : <></>
                        }
                      </div>
                    </Grid>
                  </Grid>
                </> : <>
                  <Grid container spacing={2} className={classes.noWrap}>
                    <Grid item>
                      <img src={playlist.image} className={classes.image}/>
                    </Grid>
                    <Grid item className={classes.texts}>
                      <div>
                        <Typography variant="h5" component="h2">
                          {playlist.name}
                        </Typography>
                        <Typography variant="subtitle2" component="span" color="textSecondary">
                          created for{' '}
                          <Link color="secondary" target="_blank"
                                href={`https://www.last.fm/user/${playlist.user}`}>{playlist.user}</Link>
                          {' '}on {' ' + moment(playlist.createdAt).format("dddd, MMMM Do YYYY")}
                        </Typography>
                        {
                          trackTypes.includes(playlist.type) ?
                            <Box mt={1}>
                              <Button startIcon={<Icon>add</Icon>}
                                      variant="contained"
                                      color="secondary"
                                      size="small"
                                      disableElevation
                                      onClick={() => {
                                        setPlaylistId(null)
                                        setUserData(null)
                                        setLoading(false)
                                        setOpenDialog(true)
                                      }}
                              >
                                Save
                              </Button>
                            </Box> : <></>
                        }
                      </div>
                      <Typography variant="body1" component="span" color="textSecondary">
                        {playlist.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              }
              <div>

              </div>
            </div>
            <div className={classes.items}>
              <Typography variant="h6">
                {texts.types[playlist.type]}
              </Typography>
              <List className={classes.fullWidth}>
                {
                  playlist.items.map(item => (
                    <ListItem className={smallSize ? classes.smallItem : {}}>
                      <ListItemAvatar>
                        <Avatar variant="rounded" className={smallSize ? classes.smallAvatar : classes.avatar}>
                          <img src={item.image} width={smallSize ? 44 : 60}/>
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.name} secondary={item.artist}/>
                    </ListItem>
                  ))
                }
              </List>
            </div>

          </CardContent>
        </Card>
      </Container>
      <Dialog
        fullWidth={!!userData}
        maxWidth="sm"
        onClose={() => setOpenDialog(false)}
        open={openDialog}
        disableBackdropClick={loading}
        disableEscapeKeyDown={loading}
      >
        {
          loading ? <LinearProgress color="secondary"/> : ''
        }
        {
          userData ?
            playlistId ? <>
                <DialogContent>
                  {
                    userData.service === 'spotify' ?
                      <>
                        <Link className={classes.link} color="secondary"
                              href={`https://open.spotify.com/playlist/${playlistId}`}>{`https://open.spotify.com/playlist/${playlistId}`}</Link>
                        <iframe src={`https://open.spotify.com/embed/playlist/${playlistId}`} width="100%" height="600"
                                frameBorder="0" allowTransparency="true" allow="encrypted-media"/>
                      </>
                      : <>
                        <Link className={classes.link} color="secondary"
                              href={`https://www.deezer.com/playlist/${playlistId}`}>{`https://www.deezer.com/playlist/${playlistId}`}</Link>
                        <iframe scrolling="no" frameBorder="0" allowTransparency="true"
                                src={`https://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=800&height=350&color=ec407a&layout=dark&size=medium&type=playlist&id=${playlistId}&app_id=418642`}
                                width="100%" height="600"/>
                      </>
                  }
                </DialogContent>
              </>
              : <>
                <DialogTitle>
                  Save the playlist
                </DialogTitle>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={userData.user.image}/>
                  </ListItemAvatar>
                  <ListItemText
                    primary={userData.user.name}
                    secondary={'@' + userData.user.username}
                  />
                </ListItem>
                <DialogContent>
                  <DialogContentText>
                    {
                      loading ? 'Saving playlist...'
                        : `The playlist will be saved on your ${userData.service} account. Continue?`
                    }
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => {
                    setUserData(null)
                    setOpenDialog(false)
                  }} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={createPlaylist} color="secondary" autoFocus>
                    Save
                  </Button>
                </DialogActions>
              </>
            : <>
              <DialogTitle>
                Choose a service
              </DialogTitle>
              <List>
                <ListItem button onClick={handleSpotify}>
                  <ListItemAvatar>
                    <Avatar className={classes.serviceLogo}>
                      <SpotifyLogo/>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Spotify"/>
                </ListItem>
                <ListItem button onClick={handleDeezer}>
                  <ListItemAvatar>
                    <Avatar variant="square" className={classes.serviceLogo}>
                      <DeezerLogo/>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Deezer"/>
                </ListItem>
              </List>
            </>
        }

      </Dialog>
    </Scaffold>
  )
}

// export async function getStaticPaths() {
//   console.log(`${API_URL}/playlists/`)
//   const res = await fetch(`${API_URL}/playlists/`)
//     .then(r => r.json())
//   return {
//     paths: res?.playlists?.map(id => `/${id}`) ?? [],
//     fallback: true
//   }
// }

export async function getServerSideProps({params}) {
  const {playlist} = params
  const res = await fetch(`${API_URL}/playlists/${playlist}`)
    .then(r => r.json())
    .catch(e => {
      console.error(e)
      return <h2>whoopsie error</h2>
    })

  console.log(res)
  return {
    props: {
      playlist: res
    }
  }
}
