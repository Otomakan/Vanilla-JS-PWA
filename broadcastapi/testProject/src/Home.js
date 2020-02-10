import React from 'react'
import {useState, setState} from 'react'
export default () => {
  let name = ''
  const changeName = ()=> {
    name = "bob"
  }
  return (
    <div className="home-container">
      <h1>
        Home
      </h1>
      <input onChange={(e)=>{changeName()}} placeholder="Your name"></input>
    </div>
  )
}