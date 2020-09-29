import queryString from 'querystring'
import Link from "next/link";
import {useEffect, useState} from "react";
import { API_URL } from '../../vars.js'
import fetch from 'node-fetch'
import useSWR from 'swr'

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

const fetcher = async url => {
  const hash = window.location.hash.replace('#', '')
  const token = parseQuery(hash).access_token
  const rest = await fetch(`${API_URL}/playlists/deezer/me`, {
    headers: {
      Authorization: token
    }
  }).then(r => r.json())

  console.log(rest)
  return {
    user: rest,
    token
  }
}

function DeezerCallback() {
  const a = useSWR(API_URL, fetcher)
  const { data, error } = a
  if (error) return <h1>An error ocorrured: {JSON.stringify(error)}</h1>
  if (!data) return <h1>Loading...</h1>

  window.opener.connect(data)
  window.close()
  return <h1>Hello {data.firstname} {data.lastname}</h1>
}

export default DeezerCallback
