import React, { Component } from 'react';
import { Layout } from 'antd';
import { Form, Icon, Input, Button,Switch } from 'antd';
import { Typography, message } from 'antd';
import axios from 'axios';
import Qs from 'qs';
import Cookies from 'js-cookie';

import './App.css';


const {  Content, Footer } = Layout;
const { Title } = Typography;

const api_url = "https://www.wakasann.com/kuaishouv/api_ksvd.php";

message.config({
  duration: 2,
  maxCount: 2,
});

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}


class HorizontalLoginForm extends React.Component {

  constructor(props){
    super(props);

    let show_video = Cookies.get('show_video');
    if(show_video === undefined){
      show_video = true;
    }else{
      show_video = (show_video === "false")?false:true;
    }
    Cookies.set('show_video',show_video);
    this.state={
      mydata:[],
      loading:false,
      showVideo: show_video,
      videoLink: "",
      videoHtml: ""
    }
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
  }


  handleSubmit = e => {
    const _this=this;
    e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        axios.post(api_url,Qs.stringify({
            share_url:values.username
        }))
        .then(res=>{
            let resData = res.data;
            if(resData.state_code === 0){
              message.error(res.data.message);
            }else if(resData.state_code === 1){
              this.setState(
                { 
                  videoLink: resData.data.url 
                },() =>{
                  this.showVideoHtml();
                });
              
              message.success(resData.message);
            }
            this.props.form.setFieldsValue({
              username: "",
            });
            this.setState({ loading: false });
            this.props.form.validateFields();
            console.log('res=>',res);            
        })

      }else{
        console.error(err,"errors");
      }
    });
  };

  showVideoHtml = () =>{
    // console.log(this.state.showVideo);
    if(this.state.showVideo === false){
      this.setState({
        videoHtml: "",
      });
    }else{
      this.setState({
        videoHtml: "<video  controls='controls' src='"+ this.state.videoLink +"' class='show-video'>您的浏览器不支持 video 标签。</video>",
      });
    }
  }

  switchChange = (checked) => {
    console.log(`checked = ${checked}`);
    Cookies.set('show_video',checked);
    this.setState({
      showVideo: checked,
    },() =>{
      this.showVideoHtml();
    });
    
  };

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;

    // Only show error after a field is touched.
    const usernameError = isFieldTouched('username') && getFieldError('username');

    return (
      <div>
       <div className="switch-show-video-wrapper">
        <Switch checkedChildren="显示视频" unCheckedChildren="不显示视频" checked={this.state.showVideo} onChange={this.switchChange} />
       </div>
      <Form onSubmit={this.handleSubmit} className="share-form">
        <Form.Item validateStatus={usernameError ? 'error' : ''} help={usernameError || ''} label="分享链接">
          {getFieldDecorator('username', {
            rules: [{ required: true, message: '请输入快手分享的链接'}],
            initialValue: ''
          })(
            <Input size="large" prefix={<Icon type="link" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="http://www.gifshow.com/s/2ZRF0mcz"/>,
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" loading={this.state.loading} size="large" htmlType="submit"  className="submit-form-button" disabled={hasErrors(getFieldsError())}>
            确认
          </Button>
        </Form.Item>
      </Form>
      <div>
        <a href={this.state.videoLink} className="click-video-link" target="_blank" title="视频链接">{this.state.videoLink}</a>
        <br/>
        <div className="video-wrapper" dangerouslySetInnerHTML={{ __html: this.state.videoHtml}}></div>
      </div>
      </div>
    );
  }
}
const WrappedHorizontalLoginForm = Form.create({ name: 'horizontal_login' })(HorizontalLoginForm);
function App() {

  return (
    <div>
    <Layout>
      <Content>
         <Typography>
            <Title level={4}>获取链接</Title>
         </Typography>
         <div>
           <WrappedHorizontalLoginForm />
           
         </div>
      </Content>
      <Footer>
      <p>在快手中点击分享，复制链接之后的地址哦^-^(您将同意本站使用cookies。存放是否显示视频:<strong>show_video</strong>)</p>
        <p>获取快手分享之后的短链接MP4的链接,<a href="https://github.com/wakasann/gksvideourl" target="_blank">在Github中的地址</a></p>
        </Footer>
    </Layout>
  </div>
  );
}
//npm isntall axios --save
export default App;
