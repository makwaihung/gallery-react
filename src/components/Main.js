require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ImageFigure from './ImageFigure';
import ControllerUnit from './ControllerUnit';
import {findDOMNode} from 'react-dom';

//获取图片相关数据
var imageDatas = require('../data/imageDatas.json');

/*
 * 获取区间内的一个随机值
 */
function getRangeRandom(low, high) {
    return Math.ceil(Math.random() * (high - low) + low);
}
/*
 * 获取 0~30° 之间的一个任意正负值
 */
function get30DegRandom() {
  return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}


class AppComponent extends React.Component {

  constructor(props){
    super(props);
    this.imageDatas = this.getImageURL(imageDatas);

    this.constant = {
      centerPos:{ //中心位置
        left: 0,
        right: 0
      },
      hPosRange: {  //水平方向的取值范围
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
      },
      vPosRange: {  //垂直方向的取值范围
        x: [0, 0],
        topY: [0, 0]
      }
    }

    this.state = {
      imgsArrangeArr: [
                    // {
                    //     pos: {
                    //       left: 0,
                    //       top: 0
                    //     },
                    //     rotate: 0,           // 旋转角度
                    //     isInverse: false,    // 图片正反面
                    //     isCenter: false    // 图片是否居中
                    // }
                  ]
    }



  }


  /*
   * 翻转图片
   * @param index 传入当前被执行inverse操作的图片对应的图片信息数组的index值
   * @returns {Function} 这是一个闭包函数, 其内return一个真正待被执行的函数
   */
  inverse(index){
    return function () {
      var imgsArrangeArr = this.state.imgsArrangeArr;

      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

      this.setState({
        imgsArrangeArr: imgsArrangeArr
      });
    }.bind(this);
  }

  /*
 * 利用arrange函数， 居中对应index的图片
 * @param index, 需要被居中的图片对应的图片信息数组的index值
 * @returns {Function}
 */
  center(index){
    return function () {
      this.rearrange(index);
    }.bind(this);
  }


  //将图片信息转成图片URL路径信息
  getImageURL(imageDatasArr){
    for(let i = 0, j = imageDatasArr.length; i < j; i++ ){

      let singleImageData = imageDatasArr[i];

      singleImageData.imageURL = require('../images/'+ singleImageData.fileName);

      imageDatasArr[i] = singleImageData;

    }

    return imageDatasArr;
  }

  /*
  *  重新布局所有图片
  *  @ param centerIndex指定居中排布图片
  */
  rearrange(centerIndex){
    var imgsArrangeArr = this.state.imgsArrangeArr,
        constant = this.constant,
        centerPos = constant.centerPos,
        hPosRange = constant.hPosRange,
        vPosRange = constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,


        imgsArrangeTopArr = [],
        topImgNum = Math.ceil(Math.random() * 2), //取一个或者不取

        topImgSpliceIndex = 0, // 标记上方图片数组index

        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

        //居中 centerIndex的图片
        imgsArrangeCenterArr[0] = {
          pos: centerPos,
          rotate: 0,
          isCenter: true
        };

        //取出布局上侧的图片状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum))
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);


        // 布局位于上侧的图片
        imgsArrangeTopArr.forEach(function (value, index) {
            imgsArrangeTopArr[index] = {
              pos: {
                  top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                  left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
              },
              rotate: get30DegRandom(),
              isCenter: false
            };
        });

        // 布局左右两侧的图片
        for (var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {
            var hPosRangeLORX = null;

            // 前半部分布局左边， 右半部分布局右边
            if (i < k) {
                hPosRangeLORX = hPosRangeLeftSecX;
            } else {
                hPosRangeLORX = hPosRangeRightSecX;
            }

            imgsArrangeArr[i] = {
              pos: {
                  top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                  left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
              },
              rotate: get30DegRandom(),
              isCenter: false
            };

        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
            imgsArrangeArr: imgsArrangeArr
        });
  }


  //组件加载之后，为每张图片计算取值范围
  componentDidMount(){
      //获取舞台大小
      let stageDOM = findDOMNode(this.refs.stage),
          stageW =  stageDOM.scrollWidth,
          stageH =  stageDOM.scrollHeight,
          halfStageW =  Math.ceil(stageW / 2 ),
          halfStageH =  Math.ceil(stageH / 2 );

      //获取imageFigure大小
      let imageFigureDOM = findDOMNode(this.refs.imageFigure0),
          imgW = imageFigureDOM.scrollWidth,
          imgH = imageFigureDOM.scrollHeight,
          halfImgW = Math.ceil(imgW / 2),
          halfImgH = Math.ceil(imgH / 2);

      //计算中心图片位置点
      this.constant.centerPos = {
        left: halfStageW - halfImgW,
        top: halfStageH - halfImgH
      }

      //计算左侧，右侧区域图片排布位置取值范围
      this.constant.hPosRange.leftSecX[0] = -halfImgW;
      this.constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;

      this.constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
      this.constant.hPosRange.rightSecX[1] = stageW - halfImgW;

      this.constant.hPosRange.y[0] = -halfImgH;
      this.constant.hPosRange.y[1] = stageH -halfImgH;

      // 计算上方区域图片排布位置取值范围
      this.constant.vPosRange.topY[0] = -halfImgH;
      this.constant.vPosRange.topY[1] = halfStageH - halfImgH * 3

      this.constant.vPosRange.x[0] = halfStageW - imgW;
      this.constant.vPosRange.x[1] = halfStageW;

      this.rearrange(0);


  }


  render() {

    let ImageFigureNode = this.imageDatas.map( (imageDatas,index) => {

        if(!this.state.imgsArrangeArr[index]){
          this.state.imgsArrangeArr[index] = {
            pos: {
              left: 0,
              top: 0
            },
            rotate: 0,
            isInverse: false,
            isCenter: false
          }
        }

      return (
        <ImageFigure ref={'imageFigure'+ index } key = {index}
                     imageURL={imageDatas.imageURL}
                     title={imageDatas.title}
                     desc={imageDatas.desc}
                     arrange= {this.state.imgsArrangeArr[index]}
                     inverse={this.center(index)}
                     center={this.center(index)}
                     />
          )
    });

    return (
        <section className="stage" ref="stage">
            <section className="img-sec">
                {ImageFigureNode}
            </section>
            <nav className="controller-nav">
              { ControllerUnit }
            </nav>
        </section>
    );
  }
}

export default AppComponent;
