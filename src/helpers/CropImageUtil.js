import { Image, Dimensions, ImageEditor } from "react-native";

const winWidth = Dimensions.get("window").width;

const winHeight = Dimensions.get("window").height;


export function getUrlFromLocalImageSource(source){
	let imgInfo = Image.resolveAssetSource(source);
	return imgInfo.uri;
}


export function getImageSize(uri){
	return new Promise((resolve,reject)=>{
		Image.getSize(
			uri,
			(width,height)=>{
				resolve({
					width,
					height
				})
			},
			(err)=>{
				reject(err)
			}
		)
	})
}

export function cropImagePromise(uri,config,x,y,row,column,thumbnailWidth,thumbnailHeight){
	return new Promise((resolve,reject)=>{
	  ImageEditor.cropImage(uri,config,function(uri){
	    let obj ={
	      x:x,
	      y:y,
	      uri:uri,
	      index:column*y+x,
	      curIndex:column*y+x,
	      fullWidth:winWidth/column,
	      fullHeight:winWidth/column*(thumbnailHeight/thumbnailWidth),
	      originalWidth:thumbnailWidth,
	      originalHeight:thumbnailHeight,
	      isNULL:x===column-1&&y===row-1
	    }
	    resolve(obj);
	  },function(err){
	    reject(err);
	  })
	})
}


export async function createCropImageList(uri,row,column){
	let {width:imgWidth,height:imgHeight} = await getImageSize(uri);
	let thumbnailWidth = imgWidth/column;
	let thumbnailHeight = imgHeight/row;
	let promiseArr = [];
	for(let i=0;i<column;i++){
		for(let j=0;j<row;j++){
			let config = {
				offset: {
					x: i*thumbnailWidth,
					y: j*thumbnailHeight
				},
				size:{
					width:thumbnailWidth,
					height:thumbnailHeight
				}
			}
			promiseArr.push(cropImagePromise(uri,config,i,j,row,column,thumbnailWidth,thumbnailHeight))
		}
		
	}
	return Promise.all(promiseArr);
}