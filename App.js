import React, { Component } from 'react';

import './App.css';
import * as faceapi from 'face-api.js';


class App extends Component {


    state = {
              labels: []
              }


 startWebcam = () =>{
    
        navigator.getUserMedia (

          // constraints
                {
                   video: true,
                   audio: false
                },

          // successCallback
                function(a) {   
                const video = document.querySelector('video');

                video.srcObject = a; 

                },

          // errorCallback
                function() {}

        );

    } 




main = async () => {

        this.startWebcam();
        const MODEL_URL = './models/';
        await faceapi.loadFaceRecognitionModel(MODEL_URL);
        await faceapi.loadMtcnnModel(MODEL_URL);

        console.log("MODEL LOADED");

        const imgEl = document.getElementById('video');
           
        const lab = this.state.labels;
        console.log("labels are:",lab);


        let ar = [];
        let arLength = ar.length;

        const IMAGE_SIZE = 200;
        const container = document.getElementById('file-container1');
        const file  = document.querySelector('input[type=file]').files[0];
        const reader  = new FileReader();

        reader.addEventListener("load", function () {
            const preview = document.createElement('img');
            preview.setAttribute("id", "imgx");
            preview.src = reader.result;
            preview.width = IMAGE_SIZE;
            preview.height = IMAGE_SIZE;
            const a = container.appendChild(preview);
            container.appendChild(document.createTextNode(name));
            container.appendChild(document.createElement('br'));
            
            preview.onload = () => {
                var element = document.querySelectorAll("#imgx");
                var elementX = Array.from(element);
                console.log("element",element);
                console.log("elementlength",element.length);
                console.log("elementX",elementX);
                console.log("elementXlength",elementX.length);
                
                elementX.forEach((el) => {
                ar.push(el);
                console.log("ar1",ar);
                });
              }
        }, false);

        if (file) {
            reader.readAsDataURL(file);
          }

        const name = document.getElementById("name").value; // grab the current value for x
        const nameX= this.state.labels;
        nameX.push(name); // append that value to the xs
        this.setState({nameX});
        document.getElementById('name').value = '';
        document.getElementById('upload').value = '';


        async function onPlay(imgEl) {

            const { width, height } = faceapi.getMediaDimensions(imgEl);

            const canvas =  document.getElementById('overlay');
            canvas.width = width;
            canvas.height = height;
            
            const ts = Date.now();

            const mtcnnForwardParams = {
              // limiting the search space to larger faces for webcam detection
              minFaceSize: 100
            };

            const fullFaceDescriptions = (await faceapi.allFacesMtcnn(imgEl, mtcnnForwardParams))
            .map(fd => fd.forSize(width, height));
            console.log("fullFaceDescriptions",fullFaceDescriptions);

            fullFaceDescriptions.forEach((fd) => {
            faceapi.drawDetection(canvas, fd.detection, { withScore: true, color: 'blue' })
            });

            fullFaceDescriptions.forEach((fd) => {
            faceapi.drawLandmarks(canvas, fd.landmarks, { drawLines: true, color: 'red',lineWidth: 4 })
            });

            console.log("done in", (Date.now() - ts));


            try {

            let i;
            for (i = 0; i < ar.length; i++) { 

                  const refDescriptions = (await faceapi.allFacesMtcnn(ar[i], mtcnnForwardParams))
                  .map(fd => fd.forSize(width, height));

                  console.log("refDescriptions",refDescriptions);
                  console.log("ar[i]",i, ar[i]);

                  let y = refDescriptions.map(({descriptor}) => {
                            return descriptor;
                         });

                  console.log("y",y);

                  const refDescriptors =  y.map((z) => ({     
                  label: lab[i],
                  descriptor: z,
                         }));
              
                  console.log("refDescriptors",refDescriptors);
                  console.log("iiiiiii",i,lab[i],);

                  const sortAsc = (a, b) => a - b

                  const results = fullFaceDescriptions.map((fd) => {
                     const bestMatch = refDescriptors.map(
                                     ({ descriptor, label }) => ({
                                        label,
                                        distance: faceapi.euclideanDistance(fd.descriptor, descriptor)
                                      })
                                    ).sort(sortAsc)[0]
                                 
                                  return {
                                    detection: fd.detection,
                                    label: bestMatch.label,
                                    distance: bestMatch.distance
                                  }
                                });


                  console.log("results",results);

                  results.forEach(result => {
                                  faceapi.drawDetection(canvas, result.detection, { withScore: false })
                
                                  if (result.distance<0.4){
                                      const text = `${result.label}`
                                      // ${result.distance.toFixed(2)*100}%             ${i} `
                                      const { x, y, height: boxHeight } = result.detection.getBox()
                                      faceapi.drawText(
                                        canvas.getContext('2d'),
                                        x,
                                        y + boxHeight,
                                        text, {color: 'red'}
                                        )
                                  }
                           })
                      }

                }

                catch(error) {
                  console.error(error);
                  // expected output: SyntaxError: unterminated string literal
                  // Note - error messages will vary depending on browser
                }        

        }  

          setInterval(

              async function(){ const ts1 = Date.now(); await onPlay(imgEl); 
              console.log("TS2 done in", (Date.now() - ts1));}, 1000
            );


      }



  render() {
    return (

      <div>

 
 <h4 className="App-title">Face recognition with face-api.js - and type name and upload images for every person you wanna track, then u good to go</h4>
 
          <div id="container" onLoad= {this.main}>
            <video className="img" id="video"  width="640" height="480" controls autoPlay ></video>
            <canvas id="overlay" />
       </div>
        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
        <br/>

           

          <div id="file-container1" >
              <input type="file" id = "upload" onChange= {this.main}/>
              <label htmlFor="name">Name: </label>
              <input type="text" size="10" id = "name"  placeholder="Enter name" /><br/><br/>

          </div>


          </div>




    );
  }
}

export default App;
