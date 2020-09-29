import queryString from 'querystring'
import Link from "next/link";
import {useEffect, useState} from "react";
import { API_URL } from '../../vars.js'
import fetch from 'node-fetch'
import useSWR from 'swr'

const fetcher = code => async url => {
  const rest = await fetch(`${url}/auth/spotify/callback?code=${code}`).then(r => r.json())
  console.log(rest)
  return rest
}

function SpotifyCallback({ code }) {
  const a = useSWR(API_URL, fetcher(code))
  const { data, error } = a
  if (error) return <h1>An error ocorrured: {JSON.stringify(error)}</h1>
  if (!data) return <h1>Loading...</h1>

  window.opener.connect(data)
  window.close()
  return <h1>Hello {data.user.display_name}</h1>
}

SpotifyCallback.getInitialProps = ({ query }) => {
  return {
    code: query.code
  }
}

export default SpotifyCallback
