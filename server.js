var express=require('express');
var bodyParser=require('body-parser');

var app=express();
var http=require('http').Server(app);
var io=require('socket.io')(http);
var mongoose=require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

mongoose.Promise=Promise;
//var dbUrl='mongodb+srv://user:user@cluster0-kdygx.mongodb.net/test?retryWrites=true&w=majority';

var Message=mongoose.model('Message',{
    name:String,
    message:String
})

var messages =
    [
        {name:"Tim",message:"this is Tim"},
        {name:"Jack",message:"Jack here"},
        {name:"madonna",message:"maddy"}
    ]

app.get('/messages',(req,res)=>{
   // res.send(messages);
   Message.find({},(err,data)=>{
        res.send(data);
   })
});
app.post('/messages',async (req,res)=>{
    try {
        //throw 'shashi'
        var message=new Message(req.body);
    var savedMessage= await message.save();
    
        console.log('saved');
        var censoredMessage= await Message.findOne({message:'badword'})
    
            if(censoredMessage){
                console.log('censored words found ',censoredMessage)
                await Message.remove({_id:censoredMessage.id});
            }
        else{
            io.emit('message',req.body);
        }
        
        res.sendStatus(200); 
    } catch (error) {
        res.sendStatus(500);
        console.log(error);
    }

    
});
io.on('connection',(socket)=>{
    console.log('user connected');
})
//default port 27017
mongoose.connect('mongodb://localhost/nodechat',{ useNewUrlParser: true });

var server=http.listen(3000,()=>{
    console.log('listening on port ', server.address().port);
});