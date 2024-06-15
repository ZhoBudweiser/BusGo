App({
  async onLaunch(options) {
    console.log("小程序启动")
    //使用function的方式进行初始化
    my.getCloudContext  = async function(){
      if(my.fncontext){
        return  my.fncontext;
      }else{
        const context = await my.cloud.createCloudContext({
          env: 'env-00jxgs8oaofe'
        });
        await context.init();
        my.fncontext = context;
      }
      return my.fncontext;
    }
  },
});
