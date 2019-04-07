import React, { Component } from 'react';
import { Text, View, StyleSheet, Image, Dimensions, ImageEditor, TouchableOpacity , LayoutAnimation} from 'react-native';
import { Constants } from 'expo';
import { PanGestureHandler,State } from 'react-native-gesture-handler'

import { UIManager } from 'react-native';

import { getUrlFromLocalImageSource, createCropImageList } from "./src/helpers/CropImageUtil.js";

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);


const source = require("./assets/image.jpg");

const winWidth = Dimensions.get("window").width;

class Item extends Component{
  constructor(props){
    super(props);
    this.state = {
      curIndex: props.item.curIndex
    }
  }

  componentDidMount(){
    // console.log(this.props.item,"mount")
  }

  shouldComponentUpdate(nextProps,nextState){
    if(nextProps.item.curIndex === this.state.curIndex){
       return false;
    }
    return true;
  }

  componentDidUpdate(){
    if(this.state.curIndex !== this.props.item.curIndex){
      this.setState({
        curIndex: this.props.item.curIndex
      })
    }
  }

  render(){
    let {item,columnNum} = this.props;

    let curIndex = item.curIndex;
    let column = curIndex%columnNum;
    let row = (curIndex - column)/columnNum;
    let itemStyle ={
      position:"absolute",
      top: row * item.fullHeight,
      left: column * item.fullWidth,
      padding:1,
      width:item.fullWidth,
      height:item.fullHeight,
    }
    let imgStyle={
      width:item.fullWidth-2,
      height:item.fullHeight-2
    }
    return (
      <PanGestureHandler
        // key={item.x + "" + item.y}
        // onGestureEvent={this.props.handleSwipe}
        onHandlerStateChange={this.props.handleSwipe}
      >
        <View style={itemStyle}>
          {!item.isNULL?(<Image source={{uri:item.uri}} style={imgStyle}/>):(<View style={{imgStyle}} />) }
        </View>
      </PanGestureHandler>
    )
  }
}

export default class App extends Component {
  constructor(props){
    super(props);

    //展现成几行几列
    this.row = 3;
    this.column = 3;

    this.state = {
      originalArr:[],
      sortedArr:[],
      imgLoadError:false
    }

    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount(){
    let imgURI = getUrlFromLocalImageSource(source);
    createCropImageList(imgURI,this.row,this.column).then(values=>{
      this.setState({
        originalArr: values,
        sortedArr: values,
      })
    }).catch(err=>{
      console.log(err,"err")
      this.setState({
        imgLoadError:true
      })
    })
  }

  handleSwipe(item,{nativeEvent}){
    if(nativeEvent.state === State.END){
      console.log(item,"swipe")
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
    let arr2  = [...this.state.sortedArr];
    let blankItem = arr.find((it)=>{
      return it.isNULL
    });
    let blankIndex = blankItem.curIndex;
    let itemIndex = item.curIndex;
    if(this.canMove(itemIndex,blankIndex,direction)){
      blankItem.curIndex = itemIndex;
      item.curIndex = blankIndex;
      this.setState({
        sortedArr:arr
      });
      LayoutAnimation.easeInEaseOut();
    }
  }

  canMove(index,blankIndex,direction){
    if(direction === "up" && index === blankIndex + this.column && blankIndex < this.column*(this.row-1)){
      return true
    }
    else if(direction === "down" && index === blankIndex - this.column && index < this.column*(this.row-1)){
      return true
    }
    else if(direction === "right" && index === blankIndex -1 && index%this.column !== (this.column-1)){
      return true
    }
    else if(direction === "left" && index === blankIndex + 1 && index%this.column !== 0){
      return true
    }
    return false;
  }

  renderItem(item){
    return <Item item={item} columnNum={this.column} handleSwipe={this.handleSwipe.bind(this,item)} key={item.x+" "+item.y}/>
  }


  exchangeIndex(from,to){
    let arr = Array.from(this.state.sortedArr);
    LayoutAnimation.easeInEaseOut();
    this.setState({
      sortedArr:arr
    })
  }

  render() {
    console.log(this.state.sortedArr);
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
  board:{
    width:winWidth,
  },
  btn:{
    width:50,
    height:30,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor:"gray"
  }
});