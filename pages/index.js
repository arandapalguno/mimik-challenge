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
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [result, setResult] = useState('unknown object');
  const [score, setScore] = useState('')

  async function runCoco(){
    const net = await cocossd.load();

    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
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

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const obj = await net.detect(video);
      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx); 
    }
  }

  const drawRect = (detections, ctx) =>{
    // Loop through each prediction
    detections.forEach(prediction => {
      console.log(prediction)
      // Extract boxes and classes
      const [x, y, width, height] = prediction['bbox']; 
      setResult(prediction['class']) 
      if(prediction['class'] === 'person'){
        setResult('Manusia')
      }
      setWidth(width)
      setHeight(height)
      setLeft(x)
      setRight(y)
      setScore( Math.round(prediction.score * 100) + '%')
    });
  }

  useEffect(() => {
    runCoco()
  },[])
  return (
    <div>
      <Webcam
          ref={webcamRef}
          muted={true} 
          className = "absolute left-0 right-0 z-10 h-full w-auto mx-auto text-center bg-gray-600"
        />
        <div style = {{height: height, left: left, top: right}} className = "absolute top-0 bottom-0 left-0 right-0 z-10 mx-auto my-auto w-auto text-center text-red-600">
          {result} <br/>score: {score}
        </div>
        <canvas
          ref={canvasRef}
          className = "absolute top-0 bottom-0 left-0 right-0 z-10 mx-auto my-auto w-auto text-center bg-gray-300 opacity-25 rounded-xl"
          style = {{height: height, left: left, top: right}}
        />
    </div>
  )
}
