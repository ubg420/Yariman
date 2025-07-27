/*
 *      ヤリマン（槍男）
 */

//var SCREEN_WIDTH   = 800;
//var SCREEN_HEIGHT   = 490;
var SCREEN_WIDTH   = 800;
var SCREEN_HEIGHT   = 490;

var SCREEN_CENTER_X = SCREEN_WIDTH/2;
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;

var gravity = new b2Vec2(0, 9.8);
var WORLD = new b2World(gravity, true);

var WORLD_SCALE = 20;
var WORLD_WIDTH = 40;
var WORLD_HEIGHT = 25;

//グループ作成
var YARIGROUP;
var MAMMOSGROUP;

var YARICOUNT;
var SCORE;

var GAMEFLG;



var ASSETS = {
    "title":  "./image/title.png",
    "yari":  "./image/yari.png",
    "back": "./image/back.png",
    "player":  "./image/player.png",
    "playerSS":  "./playerSS.tmss",
    "Manmos":  "./image/Manmos.png",
    "tori":  "./image/tori.png",


};

//リザルト画面の設定
var RESULT_PARAM = {
        score: 0,
        msg:      "",
        url:      "http://cachacacha.com/Yariman/",
        hashtags: "YARIMAN",
        width:    SCREEN_WIDTH,
        height:   SCREEN_HEIGHT,
        related:  "tmlib.js Tutorial testcording",
};
//ゲーム画面のラベル
var UI_DATA = {
    main: { // MainScene用ラベル
        children: [{
            //スコア
                type: "Label",
                name: "score",
                fontSize: 32,
                fillStyle: "Black",

                x: 130,
                y: 145,
            },
            {
                type: "Label",
                name: "yaricount_lavel",
                x: 75,
                y: 70,
                fillStyle: "Black",
                text: " ",
                fontSize: 40,
             }],

    }
};

//main -------------------------------------------------------------------------------
tm.main(function() {
    var app = tm.app.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();

    var loading = tm.app.LoadingScene({
        assets: ASSETS,
        nextScene: TitleScene,
    });

    app.replaceScene(loading);

    //app.replaceScene(TitleScene());
    //app.replaceScene(MainScene());

    app.run();
});


//タイトル画面----------------------------------------------------------------------
tm.define("TitleScene", {
    superClass : "tm.app.TitleScene",

    init : function() {
        this.superInit({
            title :  "",
            width :  SCREEN_WIDTH,
            height : SCREEN_HEIGHT
        });


        this.title = tm.app.Sprite("title", SCREEN_WIDTH, SCREEN_HEIGHT).addChildTo(this);
        this.title.position.set(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);


        // 画面(シーンの描画箇所)をタッチした時の動作
        this.addEventListener("pointingend", function(e) {
            // シーンの遷移
            e.app.replaceScene(GameScene());
        });


    },
});


//リザルト画面----------------------------------------------------------------------
tm.define("EndScene", {
    superClass : "tm.app.ResultScene",

    init : function(point) {

        RESULT_PARAM.msg = GameoverMSG();
        RESULT_PARAM.score = SCORE;

        this.superInit(RESULT_PARAM);

        this.Name = tm.app.Label("サイト").addChildTo(this);
        this.Name
            .setPosition(650, 380)
            .setFillStyle("#FFFFF")
            .setFontSize(25);
            var tweetButton = this.tweetButton = tm.ui.GlossyButton(180, 40, "#32cd32", "かちゃコム").addChildTo(this);
            tweetButton.setPosition(680,420);
            tweetButton.onclick = function() {
                window.open("http://cachacacha.com");
            };

        var yc = YARIGROUP.children;
        yc.each(function(yari) {
                WORLD.DestroyBody(yari.yari);
        });

        var ec = MANMOSGROUP.children;
        ec.each(function(Manmos) {
                WORLD.DestroyBody(Manmos.Manmos);

        });


    },

    onnextscene: function (e) {
        e.target.app.replaceScene(GameScene());
    },

});




/*---------------------------------------------------------------

                        ゲームシーン

-----------------------------------------------------------------*/
tm.define("GameScene", {
    superClass: "tm.app.Scene",

    init: function() {
        // 親の初期化
        this.superInit();

        YARICOUNT = 30;
        SCORE = 0;
        GAMEFLG = 0; //1でゲームオーバ


        //背景画像の設定   'ちなみに　画像は最初に生成したヤツが一番奥にくる　画像のグループも同様　スプライトのグループは背景画像のあとに書くこと'
        var back = tm.app.Sprite("back", SCREEN_WIDTH, SCREEN_HEIGHT).addChildTo(this);
        back.position.set(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);

        //ラベルの登録
        this.fromJSON(UI_DATA.main);

        //タイマー設定
        this.timer = 1;
        //ゲームレベル設定
        this.Level = 1;

        //スプライトグループ登録
        YARIGROUP = tm.app.CanvasElement().addChildTo(this);
        MANMOSGROUP = tm.app.CanvasElement().addChildTo(this);

        // 重力と物理世界の設定
        var gravity = new b2Vec2(0, 9.8);
        this.world = new b2World(gravity, true);

        //床の作成
        var ground = createbox(WORLD,0,0,WORLD_HEIGHT,WORLD_WIDTH,1);

        //主人公の作成
        this.player = Player().addChildTo(this);


        this.enemy_create();

        var Manmos = Manmos_create(this.Level).addChildTo(MANMOSGROUP);

    },

    update: function(app) {
        var timeStep = 1 / 30;
        var velocityIterations = 1;
        var positionIterations = 1;
        var p = app.pointing;

        //タッチされたら
        if(app.pointing.getPointingStart() == true){

            if(YARICOUNT > 0){
                //槍を投げるアニメーション
                this.player.gotoAndPlay("nage");
                //タッチされた場所に向けて槍を飛ばす
                var yari = yari_create(WORLD,p.x /20,p.y /20).addChildTo(YARIGROUP);
                YARICOUNT--;
                if(YARICOUNT == 0){
                    this.player.gotoAndPlay("owata");
                }
            }
        }

        //敵を出現させる
        this.enemy_create();


        if(this.timer % 300 == 0){
            this.Level += 1;
        }


        // 物理空間の更新
        WORLD.Step(timeStep,velocityIterations,positionIterations);



        this.timer++;

        //画面の更新
        this.yaricount_lavel.text = YARICOUNT;
        this.score.text = SCORE;

        if(GAMEFLG == 1){
            this.GAMEOVER(app);
        }


    },

    enemy_create: function(){

        //マンモス生成
        if(this.timer % 90 == 0){
            var Manmos = Manmos_create(this.Level).addChildTo(MANMOSGROUP);

        }

        //トリの生成
        if(this.timer % 120 == 0　&& this.Level > 2){
            var tori = tori_create(this.Level).addChildTo(this);

        }



    },

    //ゲームオーバー処理　box2dオブジェクトは勝手に消えないので、ちゃんと消す
    GAMEOVER: function(app){

        app.replaceScene(EndScene());

    },



});

/*---------------------------------------------------------------

                        槍を作成する
                        yari_create(b2world,ポイント位置x,y)
                                              　
-----------------------------------------------------------------*/
var yari_create = tm.createClass({
    superClass: tm.app.Sprite,

    init: function(world,x,y) {
        this.superInit("yari");

        //Box2d用パラメータ
        this.Box2d_x = 4;
        this.Box2d_y = WORLD_HEIGHT - 4;
        this.Box2d_width = 1.2;
        this.Box2d_height = 0.3;
        this.Box2d_type = 1;    //静的か動的か　0:静的　１：動的


        this.Scale = 20;

        this.timer =0;


        this.width = this.Box2d_width * (this.Scale * 2);
        this.height = this.Box2d_height * (this.Scale * 2);

        //Box2dオブジェクトを作成する
        this.yari = createbox(WORLD,this.Box2d_type,this.Box2d_x,this.Box2d_y,this.Box2d_width,this.Box2d_height,1);

        //槍の飛ぶ方向と力
        var vector_x = (x - this.Box2d_x);
        var vector_y = (y - this.Box2d_y) -5;


        this.yari.SetLinearVelocity(new b2Vec2(vector_x, vector_y));



    },

    update: function(app) {
        //Box2d世界から位置を取得する
        this.x = this.yari.GetPosition().x * this.Scale;
        this.y = this.yari.GetPosition().y * this.Scale;

        //Box2d世界から角度を取得する（ラジアンから度に直す）
        this.rotation = this.yari.GetAngle() * 180 / Math.PI;
        if(this.timer > 50　&& this.y > SCREEN_HEIGHT - 30){
            WORLD.DestroyBody(this.yari);
        }

        this.timer++;
    },

});



/*---------------------------------------------------------------

                        マンモス作成クラス
                        'Manmos_create
                        ・敵の作成
                        ・                     　
-----------------------------------------------------------------*/
tm.define("Manmos_create", {
    superClass: "tm.app.Sprite",

init: function(Level) {
        this.superInit("Manmos");

        this.Size;
        this.Speed;
        this.Start_y;

        this.Manmos_Level(Level);


        //Box2d用パラメータ
        this.Box2d_x = WORLD_WIDTH;
        this.Box2d_y = WORLD_HEIGHT - this.Start_y - this.Size;
        this.Box2d_width = this.Size;
        this.Box2d_height = this.Size;
        this.Box2d_type = 1;    //静的か動的か　0:静的　１：動的

        this.tmlib_width = 2;
        this.tmlib_height = 2;



        this.Scale = 20;

        this.timer =0;

//        this.width = this.Box2d_width * (this.Scale * 2);
//        this.height = this.Box2d_height * (this.Scale * 2);

        this.width = this.Box2d_width * (this.Scale * 2);
        this.height = this.Box2d_height * (this.Scale * 2);


        //Box2dオブジェクトを作成する
        this.Manmos = createbox(WORLD,this.Box2d_type,this.Box2d_x,this.Box2d_y,this.Box2d_width,this.Box2d_height);


        this.Manmos.SetLinearVelocity(new b2Vec2(-this.Speed,-3));


    },

    //マンモスのレベリング
    Manmos_Level: function(Level){

        //マンモスのサイズ

        this.Size = 2;

        if(Level > 3){

            this.Size = 2 * rand(2);

        }

        if(Level > 6){

            this.Size = 2 * rand(3);

        }


        if(Level > 9){

            this.Size = 2 * rand(4);

        }



        if(Level > 15){

            this.Size = 2 * rand(5);

        }

        //マンモスのスピード
        this.Speed = 5;

        //出現する高さ
        var i = 3 * Level;
        if(i > 15){
            i = 15;
        }

        this.Start_y = rand(i) + this.Size;


    },

    update: function(app) {
        this.x = this.Manmos.GetPosition().x * this.Scale;
        this.y = this.Manmos.GetPosition().y * this.Scale;

        this.rotation = this.Manmos.GetAngle() * 180 / Math.PI;


        //下に落ちたら消える
        if(this.y > SCREEN_HEIGHT){

            YARICOUNT+= 1 * this.Size -1;
            SCORE+= 1;

            WORLD.DestroyBody(this.Manmos);
            this.remove();

        }


        if(this.x < 0){

            GAMEFLG = 1;
        }

    },

});

/*---------------------------------------------------------------

                        トリ作成クラス
                        'tori_create
                        ・敵の作成
                        ・                     　
-----------------------------------------------------------------*/
tm.define("tori_create", {
    superClass: "tm.app.Sprite",

init: function(Level) {
        this.superInit("tori");

        this.x = SCREEN_WIDTH;
        this.y = rand(SCREEN_HEIGHT - 180);

        this.width = 70;
        this.height = 70;

        this.speed = 3 + (1 + Level / 10);

        this.rakka = 0;


    },

    update: function(app) {
        this.x -= this.speed;
        this.y += this.rakka;
        this.rotation += this.rakka * 2;

        var self = this;
        var yc = YARIGROUP.children;
        yc.each(function(yari) {
            if (self.isHitElement(yari)) {
                self.speed = -10;
                self.rakka = 10;
            };
        });

        if(this.y > SCREEN_HEIGHT * 2){

            YARICOUNT+= 1;
            SCORE+= 1;


            this.remove();
        }


        if(this.x < 0){

            GAMEFLG = 1;
        }


    },

});

/*---------------------------------------------------------------

                        プレイヤークラス
                        ・主人公の作成
                        ・                     　
-----------------------------------------------------------------*/
tm.define("Player", {
    superClass: "tm.app.AnimationSprite",

    init: function () {
        this.superInit("playerSS");
        this.gotoAndPlay("tame");

        this.width = 50;
        this.height = 50;


        this.x = 50;
        this.y = 450;

    },

    update: function(app) {


    },

});


/*---------------------------------------------------------------

                        createbox(World,type,位置xy,幅,高さ)
                        ・box2dオブジェクトの作成
                        ・type = 0:静的オブジェクト　1:動的オブジェクト
                        　
-----------------------------------------------------------------*/
function createbox(world,type,x,y,width,height,option){
    var boxFixDef,boxShape,boxBodyDef,b2body;

    //フィクスチャーの定義を生成
    boxFixDef = new b2FixtureDef();
    boxFixDef.density = 1.0;
    boxFixDef.friction = 1;
    boxFixDef.restitution = 1;

    if(option == 1){
        boxFixDef.density = 10.0;
        boxFixDef.friction = 0.5;
        boxFixDef.restitution = 0.2;
    }

    //フィクスチャーの形
    boxShape = new b2PolygonShape();
    boxShape.SetAsBox(width, height);
    boxFixDef.shape = boxShape;

    //ボディを定義
    boxBodyDef = new b2BodyDef();
    boxBodyDef.position.Set(x, y);
    //動的か静的か
    if(type == 0){
        boxBodyDef.type = b2Body.b2_staticBody;
    }
    else{
        boxBodyDef.type = b2Body.b2_dynamicBody;
    }

    b2body = world.CreateBody( boxBodyDef );//ボディをworldに生成し…
    b2body.CreateFixture( boxFixDef );//フィクスチャーを追加する

    return b2body;
}



//乱数生成
function rand(n){
    return Math.floor(Math.random() * (n)) + 1;
}


function GameoverMSG(){

    var msg = "ヤリマンのめざめ";
    if(SCORE > 30){
            var msg = "ボランティアのヤリマン";
    }

    if(SCORE > 50){
            var msg = "村のヤリマン";
    }

    if(SCORE > 70){
            var msg = "町内のヤリマン";
    }

    if(SCORE > 100){
            var msg = "都会のヤリマン";
    }

    if(SCORE > 130){
            var msg = "世界のヤリマン";
    }

    if(SCORE > 170){
            var msg = "宇宙のヤリマン";
    }

    if(SCORE > 200){
            var msg = "超ヤリマン";
    }


    return msg;

}
