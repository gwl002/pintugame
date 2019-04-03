import React, { Component } from 'react';
import { Text, View, StyleSheet,Image,Dimensions, ImageEditor, TouchableOpacity , LayoutAnimation} from 'react-native';
import { Constants } from 'expo';
import { PanGestureHandler,State } from 'react-native-gesture-handler'

import { UIManager } from 'react-native';

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);


const source = require("./assets/image.jpg");

const winWidth = Dimensions.get("window").width;

function cropImagePromise(uri,config,i,j){
  return new Promise((resolve,reject)=>{
    ImageEditor.cropImage(uri,config,function(uri){
      let obj ={
        x:i,
        y:j,
        uri:uri,
        isNULL:i===2&&j===2
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
      originalArr:[],
      sortedArr:[],
      imgLoadError:false
    }
  }

  componentDidMount(){
    let imgInfo = Image.resolveAssetSource(source);
    createImages(imgInfo).then(values=>{
      console.log(values);
      this.setState({
        imgInfo:imgInfo,
        originalArr: values,
        sortedArr: values,
      })
    }).catch(err=>{
      this.setState({
        imgLoadError:true
      })
    })
  }

  handleSwipe(index,{nativeEvent}){
    if(nativeEvent.state === State.END){
      let { translationX, translationY } = nativeEvent;
      if(Math.abs(translationX) > Math.abs(translationY) && translationX < 0){
        this.slideImage(index,"left");
      }else if(Math.abs(translationX) > Math.abs(translationY) && translationX > 0){
        this.slideImage(index,"right");
      }else if(Math.abs(translationX) < Math.abs(translationY) && translationY > 0){
        this.slideImage(index,"down");
      }else if(Math.abs(translationX) < Math.abs(translationY) && translationY < 0){
        this.slideImage(index,"up")
      }
    }
  }

  slideImage(index,direction){
    let currentIndex = this.state.sortedArr.findIndex(item=> item.isNULL);
    if(this.canMove(index,currentIndex,direction)){
      this.exchangeIndex(index,currentIndex)
    }
  }

  canMove(index,currentIndex,direction){
    if(direction === "up" && index === currentIndex + 3 && currentIndex < 6){
      return true
    }
    else if(direction === "down" && index === currentIndex - 3 && index < 6){
      return true
    }
    else if(direction === "right" && index === currentIndex -1 && index%3 !== 2){
      return true
    }
    else if(direction === "left" && index === currentIndex + 1 && index%3 !== 0){
      return true
    }
    return false;
  }

  renderItem(item,index){
    return (
      <PanGestureHandler
        key={item.x + "" + item.y}
        onGestureEvent={({nativeEvent})=>{}}
        onHandlerStateChange={this.handleSwipe.bind(this,index)}
      >
        <View>
          {!item.isNULL?(<Image source={{uri:item.uri}} style={styles.image}/>):(<View style={styles.blankImage} />)}
        </View>
      </PanGestureHandler>
    )
  }


  exchangeIndex(from,to){
    let arr = Array.from(this.state.sortedArr);
    arr[from] = arr.splice(to,1,arr[from])[0];
    LayoutAnimation.easeInEaseOut();
    this.setState({
      sortedArr:arr
    })
  }

  render() {
    return (
      <View style={styles.container}>
        {/*<Image source={source} style={styles.image} /> */}
        <View style={styles.board} >
          <View style={styles.row}>
            {this.state.sortedArr.slice(0,3).map((item,index) => (
              this.renderItem(item,index)
              ))}
          </View>
          <View style={styles.row}>
            {this.state.sortedArr.slice(3,6).map((item,index) => (
              this.renderItem(item,index+3)
              ))}
          </View>
          <View style={styles.row}>
            {this.state.sortedArr.slice(6,9).map((item,index) => (
              this.renderItem(item,index+6)
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
  blankImage:{
    width:(winWidth-5)/3,
    height:(winWidth-5)/3,
    backgroundColor:"#ccc"
  },
  board:{
    justifyContent:"space-between",
    height:winWidth
  },
  row:{
    flexDirection:"row",
    justifyContent:"space-between",
  },
  btn:{
    width:50,
    height:30,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"gray"
  }
});