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
        x:j,
        y:i,
        uri:uri,
        index:i*3+j,
        curIndex:i*3+j,
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

  handleSwipe(item,{nativeEvent}){
    if(nativeEvent.state === State.END){
      let { translationX, translationY } = nativeEvent;
      if(Math.abs(translationX) > Math.abs(translationY) && translationX < 0){
        this.slideImage(item,"left");
      }else if(Math.abs(translationX) > Math.abs(translationY) && translationX > 0){
        this.slideImage(item,"right");
      }else if(Math.abs(translationX) < Math.abs(translationY) && translationY > 0){
        this.slideImage(item,"down");
      }else if(Math.abs(translationX) < Math.abs(translationY) && translationY < 0){
        this.slideImage(item,"up")
      }
    }
  }

  slideImage(item,direction){
    let arr = Array.from(this.state.sortedArr);
    let blankItem = arr.find((item)=>{
      return item.isNULL
    });
    let blankIndex = blankItem.curIndex;
    let itemIndex = arr[item.y*3+item.x].curIndex;
    if(this.canMove(itemIndex,blankIndex,direction)){
      blankItem.curIndex = itemIndex;
      arr[item.y*3+item.x].curIndex = blankIndex;
      this.setState({
        sortedArr:arr
      });
      LayoutAnimation.easeInEaseOut();
    }
  }

  canMove(index,blankIndex,direction){
    if(direction === "up" && index === blankIndex + 3 && blankIndex < 6){
      return true
    }
    else if(direction === "down" && index === blankIndex - 3 && index < 6){
      return true
    }
    else if(direction === "right" && index === blankIndex -1 && index%3 !== 2){
      return true
    }
    else if(direction === "left" && index === blankIndex + 1 && index%3 !== 0){
      return true
    }
    return false;
  }

  renderItem(item){
    let curIndex = item.curIndex;
    let column = curIndex%3;
    let row = (curIndex - column)/3;
    let itemStyle ={
      position:"absolute",
      top: row * winWidth/3,
      left: column * winWidth/3,
    }
    return (
      <PanGestureHandler
        key={item.x + "" + item.y}
        // onGestureEvent={this.handleSwipe.bind(this,item)}
        onHandlerStateChange={this.handleSwipe.bind(this,item)}
      >
        <View style={itemStyle}>
          {!item.isNULL?(<Image source={{uri:item.uri}} style={styles.image}/>):(<View style={styles.blankImage} />)}
        </View>
      </PanGestureHandler>
    )
  }


  exchangeIndex(from,to){
    let arr = Array.from(this.state.sortedArr);
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
          {this.state.sortedArr.map((item,index)=>{
            return this.renderItem(item)
          })}
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
  item:{
    position:"absolute",
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
    width:winWidth,
    height:winWidth
  },
  btn:{
    width:50,
    height:30,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"gray"
  }
});