import React, { Component } from 'react';
import { Text, View, StyleSheet,Image,Dimensions, ImageEditor, TouchableOpacity , LayoutAnimation} from 'react-native';
import { Constants } from 'expo';


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

  renderItem(item){
    return (
      <View key={item.x + "" + item.y}>
        {!item.isNULL?(<Image source={{uri:item.uri}} style={styles.image}/>):(<View style={styles.blankImage} />)}
      </View>
    )
  }

  goUp(){
    let currentIndex = this.state.sortedArr.findIndex(item=> item.isNULL);
    let topIndex = currentIndex - 3 ;
    console.log(currentIndex,topIndex);
    if(topIndex < 0 ){
      return;
    }else{
      this.exchangeIndex(currentIndex,topIndex);
    }
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
            {this.state.sortedArr.slice(0,3).map((item) => (
              this.renderItem(item)
              ))}
          </View>
          <View style={styles.row}>
            {this.state.sortedArr.slice(3,6).map((item) => (
              this.renderItem(item)
              ))}
          </View>
          <View style={styles.row}>
            {this.state.sortedArr.slice(6,9).map((item) => (
              this.renderItem(item)
              ))}
          </View>
        </View>
        <View>
          <TouchableOpacity onPress={this.goUp.bind(this)} style={styles.btn}>
            <Text>UP</Text>
          </TouchableOpacity>
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