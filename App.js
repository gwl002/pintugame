import React, { Component } from 'react';
import { Text, View, StyleSheet,Image,Dimensions, ImageEditor } from 'react-native';
import { Constants } from 'expo';

const source = require("./assets/image.jpg");

const winWidth = Dimensions.get("window").width;

function cropImagePromise(uri,config,i,j){
  return new Promise((resolve,reject)=>{
    ImageEditor.cropImage(uri,config,function(uri){
      let obj ={
        x:i,
        y:j,
        uri
      }
      resolve(obj);
    },function(err){
      reject(err);
    })
  })
}

function createImages(imageInfo){
  let {uri,width,height} = imageInfo;
  let thumbnailWidth = width/3;
  let thumbnailHeight = height/3;
  let promiseArr=[]
  for(let i=0;i<3;i++){
    for(let j=0;j<3;j++){
      let obj = {
        offset:{x:j*thumbnailWidth,y:i*thumbnailHeight},
        size:{width:thumbnailWidth,height:thumbnailHeight}
      }
      promiseArr.push(cropImagePromise(uri,obj,i,j));
    }
  }
  return Promise.all(promiseArr);
}

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      imgInfo:{},
      thumbnailArr:[],
      imgLoadError:false
    }
  }

  componentDidMount(){
    let imgInfo = Image.resolveAssetSource(source);
    console.log(imgInfo)
    createImages(imgInfo).then(values=>{
      console.log(values);
      this.setState({
        imgInfo:imgInfo,
        thumbnailArr: values,
      })
    }).catch(err=>{
      this.setState({
        imgLoadError:true
      })
    })
  }


  render() {
    return (
      <View style={styles.container}>
        {/*<Image source={source} style={styles.image} /> */}
        <View style={styles.board} >
          <View style={styles.row}>
            {this.state.thumbnailArr.slice(0,3).map(({uri,x,y},index) => (
              <Image source={{uri:uri}} style={styles.image} key={x+" "+y} />
              ))}
          </View>
          <View style={styles.row}>
            {this.state.thumbnailArr.slice(3,6).map(({uri,x,y},index) => (
              <Image source={{uri:uri}} style={styles.image} key={x+" "+y} />
              ))}
          </View>
          <View style={styles.row}>
            {this.state.thumbnailArr.slice(6,9).map(({uri,x,y},index) => (
              <Image source={{uri:uri}} style={styles.image} key={x+" "+y} />
              ))}
          </View>
        </View>
      </View>
    );
  }

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  image:{
    width:(winWidth-5)/3,
    height:(winWidth-5)/3
  },
  board:{
    justifyContent:"space-between",
    height:winWidth
  },
  row:{
    flexDirection:"row",
    justifyContent:"space-between",
  }
});