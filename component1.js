import React from 'react';
import logo from './logo.svg';
import './App.css';


const Comp = (props) => (

	<div>

	    <div className="App" onLoad= {props.main}>
	      <header className="App-header" >
	              <img src={logo} className="App-logo" alt="logo" /> 
	        <h4 className="App-title">Face recognition with face-api.js. Type name and upload images for every person you wanna track, then u good to go.</h4>
	      </header>     
	    </div> 

		<br/>

        <div id="container" onClick= {props.main}>
            <video className="img" id="video"  width="640" height="480" controls autoPlay ></video>
            <canvas id="overlay" />
        </div>

        <br/>      

        <div id="file-container1" >
            <input type="file" id = "upload" onChange= {props.activate}/>
            <label htmlFor="name">Name: </label>
            <input type="text" size="10" id = "name"  placeholder="Enter name" /> 
            <br/><br/>

        </div>


    </div>


);

export default Comp;