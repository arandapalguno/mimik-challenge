import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, {useRef, useState, useEffect} from "react"
import * as tf from "@tensorflow/tfjs"
import Webcam from "react-webcam"
import * as cocossd from "@tensorflow-models/coco-ssd"

export default function Home() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [results, setResults] = useState([]);
  const [drink, setDrink] = useState(0)
  const [takeacup, setTakeacup] = useState(null)
  const [foundObject, setFoundObject] = useState([])
  const [alert,setAlert] = useState(true)

  async function runCoco(){
    const net = await cocossd.load();

    //  Loop and detect hands
    setInterval(async () => {
      await detect(net);
    }, 100);
  }

  async function detect(net){
    // Check data is available
    
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make Detections
      const detect = await net.detect(video);
      // Draw mesh
      setFoundObject([])
      detect.forEach(res => {
        const color = Math.floor(Math.random()*16777215).toString(16);
        res.color = '#' + color
        setFoundObject(oldArray => [...oldArray,res.class])

      })

      setResults(detect)
    }

  }

  useEffect(() => {
    if(foundObject.length > 0){
      if(foundObject.includes('person') & foundObject.includes('cup')){
        setTakeacup(true)
      }else{
        setTakeacup(false)
      }
    }
  }, [foundObject])

  useEffect(() => {
    if(takeacup){
      console.log("already take a cup")
      setAlert(false)
    }
  },[takeacup])
  // useEffect(() => {
  //   console.log(drink)
  // }, [drink])
  
  useEffect(() => {
    const x = document.getElementById("drink"); 
    if(alert){
      x.play()
    }else{
      x.pause()
      x.currentTime = 0
    }
  }, [alert])

  useEffect(() => {
    runCoco()
    setInterval(async () => {
      await setAlert(true)
    }, 9000000);
  },[])


  return (
    <div className="flex items-center justify-center h-screen">
      
      {alert ? (
        <div className = "text-3xl bg-red-600 text-white font-bold rounded-lg border shadow-lg p-10">
        <center>
          <img className = "w-auto h-52" src = "https://monophy.com/media/30pT4ub7AFgEwvUuy7/monophy.gif"/>
        </center><br/><br/>
          WAKTUNYA MINUM !!!
        </div>
      ) : (
        <div className = "text-3xl bg-red-600 text-white font-bold rounded-lg border shadow-lg p-10">
          MINUM ITU PENTING
          <br/><br/>
          Jangan lupa minum !  
        </div>
      )}
      <audio id="drink">
        <source src="http://localhost:3000/drink.mp3" type="audio/mp3"/>
      </audio>
      <Webcam
        ref={webcamRef}
        muted={true} 
        className = "hidden absolute left-0 right-0 z-10 h-full w-auto mx-auto text-center bg-gray-600"
      />
      {/* {results.length > 0 && (
        results.map((result, index) => 
          <div key={index} >
            <div  style = {{height: result.bbox[3], left: result.bbox[0], top: result.bbox[1]}} className = "absolute top-0 bottom-0 left-0 right-0 z-10 mx-auto my-auto w-auto text-center text-white font-bold">
              {result.class} <br/>score: {Math.round(result.score*100)+'%'}
              <br/>
              {result.color}
            </div>
            <canvas
              className = "absolute top-0 bottom-0 left-0 right-0 z-10 mx-auto my-auto w-auto text-center border-2 rounded-xl"
              style = {{height: result.bbox[3], left: result.bbox[0], top: result.bbox[1], borderColor: result.color}}
            />
          </div>
        )
      )} */}
    </div>
  )
}
