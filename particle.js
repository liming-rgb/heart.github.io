
//PARTICLE_COUNT粒子数量 PARTICLE_RADIUS粒子直径 MAX_ROTATION_ANGLE TRANSLATION_COUNT
var RENDERER = {
    PARTICLE_COUNT : 1500,
    PARTICLE_RADIUS : 1,
    MAX_ROTATION_ANGLE : Math.PI / 60,
    TRANSLATION_COUNT : 100,

    init : function(strategy){
        this.setParameters(strategy);
        this.createParticles();
        this.setupFigure();
        this.reconstructMethod();
        this.bindEvent();
        this.drawFigure();
    },
    setParameters : function(strategy){
        this.$window = $(window);

        this.$container = $('#jsi-particle-container');
        this.width = this.$container.width();
        this.height = this.$container.height();

        this.$canvas = $('<canvas />').attr({width : this.width, height : this.height}).appendTo(this.$container);
        this.context = this.$canvas.get(0).getContext('2d');

        this.center = {x : this.width / 2, y : this.height / 2};

        this.rotationX = this.MAX_ROTATION_ANGLE;
        this.rotationY = this.MAX_ROTATION_ANGLE;
        this.strategyIndex = 0;
        this.translationCount = 0;
        this.theta = 0;

        this.strategies = strategy.getStrategies();
        this.particles = [];
    },
    createParticles : function(){
        for(var i = 0; i < this.PARTICLE_COUNT; i ++){
            this.particles.push(new PARTICLE(this.center));
        }
    },
    reconstructMethod : function(){
        this.setupFigure = this.setupFigure.bind(this);
        this.drawFigure = this.drawFigure.bind(this);
        this.changeAngle = this.changeAngle.bind(this);
    },
    bindEvent : function(){
        this.$container.on('click', this.setupFigure);
        this.$container.on('mousemove', this.changeAngle);
    },
    changeAngle : function(event){
        var offset = this.$container.offset(),
            x = event.clientX - offset.left + this.$window.scrollLeft(),
            y = event.clientY - offset.top + this.$window.scrollTop();

        console.log(offset);

        this.rotationX = (this.center.y - y) / this.center.y * this.MAX_ROTATION_ANGLE;
        this.rotationY = (this.center.x - x) / this.center.x * this.MAX_ROTATION_ANGLE;
    },
    setupFigure : function(){
        for(var i = 0, length = this.particles.length; i < length; i++){
            this.particles[i].setAxis(this.strategies[this.strategyIndex]());
        }
        if(++this.strategyIndex == this.strategies.length){
            this.strategyIndex = 0;
        }
        this.translationCount = 0;
    },
    drawFigure : function(){
        requestAnimationFrame(this.drawFigure);

        this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.context.fillRect(0, 0, this.width, this.height);

        for(var i = 0, length = this.particles.length; i < length; i++){
            var axis = this.particles[i].getAxis2D(this.theta);

            this.context.beginPath();
            this.context.fillStyle = axis.color;
            this.context.arc(axis.x, axis.y, this.PARTICLE_RADIUS, 0, Math.PI * 2, false);
            this.context.fill();
        }
        this.theta++;
        this.theta %= 360;

        for(var i = 0, length = this.particles.length; i < length; i++){
            this.particles[i].rotateX(this.rotationX);
            this.particles[i].rotateY(this.rotationY);
        }
        this.translationCount++;
        this.translationCount %= this.TRANSLATION_COUNT;

        if(this.translationCount == 0){
            this.setupFigure();
        }
    }
};
var STRATEGY = {
    SCATTER_RADIUS :125,
    CONE_ASPECT_RATIO : 1.5,
    RING_COUNT : 5,

    getStrategies : function(){
        var strategies = [];

        for(var i in this){
            //检查当前属性是否等于 getStrategies 方法本身
            if(this[i] == arguments.callee || typeof this[i] != 'function'){
                continue;
            }
            strategies.push(this[i].bind(this));
        }
        return strategies;
    },
    // createSphere : function(){
    //     var cosTheta = Math.random() * 2 - 1,//.random([0,1))
    //         sinTheta = Math.sqrt(1 - cosTheta * cosTheta),//[0,1]
    //         phi = Math.random() * 2 * Math.PI;//[0,2pi)
    //
    //     return {
    //         x : this.SCATTER_RADIUS * sinTheta * Math.cos(phi),
    //         y : this.SCATTER_RADIUS * sinTheta * Math.sin(phi),
    //         z : this.SCATTER_RADIUS * cosTheta,
    //         hue : Math.round(phi / Math.PI * 30)//对0-60中的随机数四舍五入
    //     };
    // },

    //椭圆
    // createEllipsoid : function (){
    //     var a = 1,
    //         b = 1,
    //         c = 1.5,
    //         phi = Math.random() * 2 * Math.PI,
    //         cosTheta = Math.random() * 2-1,
    //         sinTheta = Math.sqrt(1-cosTheta*cosTheta);
    //     return{
    //         x : this.SCATTER_RADIUS * a*sinTheta*Math.cos(phi),
    //         y : this.SCATTER_RADIUS * b*sinTheta*Math.sin(phi),
    //         z : this.SCATTER_RADIUS * c*cosTheta,
    //         hue : Math.round(phi / Math.PI * 30)
    //
    //     };
    // },

    createHeart: function() {
        // 定义角度变量 t，用于控制爱心的形状
        var t = Math.random() * Math.PI * 2; // t ∈ [0, 2π)
        // 计算爱心曲线的三维坐标
        var x = 16 * Math.pow(Math.sin(t), 3);
        var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        var z = 0.5 * Math.sin(t) * Math.cos(t); // 可以定义 z 轴的函数，控制爱心的厚度

        // 返回爱心点的坐标值和颜色 hue
        return {
            x: x * this.SCATTER_RADIUS/10,
            y: y * this.SCATTER_RADIUS/10,
            z: z * this.SCATTER_RADIUS/10,
            hue: Math.round(t / Math.PI * 30) // 类似于三维球体的 hue 计算方法
        };
    }
    // createlove: function() {
    //     // 定义变量 u 和 t，用于控制爱心的形状和厚度
    //     var u = Math.random() * 2 - 1; // u ∈ [-1, 1]，控制爱心的高度分布
    //     var t = Math.random() * Math.PI * 2; // t ∈ [0, 2π]，控制爱心的横向分布
    //
    //     // 计算爱心曲线的三维坐标
    //     var x = 16 * Math.pow(Math.sin(t), 3);
    //     var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    //     var z = u * 2; // u 控制 z 轴的分布范围，可以根据需求调整厚度系数
    //
    //     // 返回爱心点的坐标值和颜色 hue
    //     return {
    //         x: x * this.SCATTER_RADIUS/10,
    //         y: y * this.SCATTER_RADIUS/10,
    //         z: z * this.SCATTER_RADIUS/10, // 使用 SCATTER_RADIUS 缩放三维坐标
    //         hue: Math.round(t / Math.PI * 30) // 类似于三维球体的 hue 计算方法
    //     };
    //
    // }




    // createTorus : function(){
    //     var theta = Math.random() * Math.PI * 2,
    //         x = this.SCATTER_RADIUS + this.SCATTER_RADIUS / 6 * Math.cos(theta),
    //         y = this.SCATTER_RADIUS / 6 * Math.sin(theta),
    //         phi = Math.random() * Math.PI * 2;
    //
    //     return {
    //         x : x * Math.cos(phi),
    //         y : y,
    //         z : x * Math.sin(phi),
    //         hue : Math.round(phi / Math.PI * 30)
    //     };
    // }


    // createCone : function(){
    //     var status = Math.random() > 1 / 3,
    //         x,
    //         y,
    //         phi = Math.random() * Math.PI * 2,
    //         rate = Math.tan(30 / 180 * Math.PI) / this.CONE_ASPECT_RATIO;
    //
    //     if(status){
    //         y = this.SCATTER_RADIUS * (1 - Math.random() * 2);
    //         x = (this.SCATTER_RADIUS - y) * rate;
    //     }else{
    //         y = -this.SCATTER_RADIUS;
    //         x = this.SCATTER_RADIUS * 2 * rate * Math.random();
    //     }
    //     return {
    //         x : x * Math.cos(phi),
    //         y : y,
    //         z : x * Math.sin(phi),
    //         hue : Math.round(phi / Math.PI * 30)
    //     };
    // },
    // createVase : function(){
    //     var theta = Math.random() * Math.PI,
    //         x = Math.abs(this.SCATTER_RADIUS * Math.cos(theta) / 2) + this.SCATTER_RADIUS / 8,
    //         y = this.SCATTER_RADIUS * Math.cos(theta) * 1.2,
    //         phi = Math.random() * Math.PI * 2;
    //
    //     return {
    //         x : x * Math.cos(phi),
    //         y : y,
    //         z : x * Math.sin(phi),
    //         hue : Math.round(phi / Math.PI * 30)
    //     };
    // }
};


//PARTICLE对象的属性：
//1.center粒子中心2.SPEING移动系数3.FRICTION摩擦系数4.FOCUS_POSITION5.COLOR颜色
var PARTICLE = function(center){
    this.center = center;
    this.init();
};//创建粒子对象
PARTICLE.prototype = {
    SPRING : 0.01,
    FRICTION : 0.9,
    FOCUS_POSITION : 300,
    COLOR : 'hsl(%hue, 100%, 70%)',

    init : function(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.color;
    },
    setAxis : function(axis){
        this.translating = true;
        this.nextX = axis.x;
        this.nextY = axis.y;
        this.nextZ = axis.z;
        this.hue = axis.hue;
    },
    rotateX : function(angle){
        var sin = Math.sin(angle),
            cos = Math.cos(angle),
            nextY = this.nextY * cos - this.nextZ * sin,
            nextZ = this.nextZ * cos + this.nextY * sin,
            y = this.y * cos - this.z * sin,
            z = this.z * cos + this.y * sin;

        this.nextY = nextY;
        this.nextZ = nextZ;
        this.y = y;
        this.z = z;
    },
    rotateY : function(angle){
        var sin = Math.sin(angle),
            cos = Math.cos(angle),
            nextX = this.nextX * cos - this.nextZ * sin,
            nextZ = this.nextZ * cos + this.nextX * sin,
            x = this.x * cos - this.z * sin,
            z = this.z * cos + this.x * sin;

        this.nextX = nextX;
        this.nextZ = nextZ;
        this.x = x;
        this.z = z;
    },
    rotateZ : function(angle){
        var sin = Math.sin(angle),
            cos = Math.cos(angle),
            nextX = this.nextX * cos - this.nextY * sin,
            nextY = this.nextY * cos + this.nextX * sin,
            x = this.x * cos - this.y * sin,
            y = this.y * cos + this.x * sin;

        this.nextX = nextX;
        this.nextY = nextY;
        this.x = x;
        this.y = y;
    },
    getAxis3D : function(){
        this.vx += (this.nextX - this.x) * this.SPRING;
        this.vy += (this.nextY - this.y) * this.SPRING;
        this.vz += (this.nextZ - this.z) * this.SPRING;

        this.vx *= this.FRICTION;
        this.vy *= this.FRICTION;
        this.vz *= this.FRICTION;

        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        return {x : this.x, y : this.y, z : this.z};
    },
    getAxis2D : function(theta){
        var axis = this.getAxis3D(),
            scale = this.FOCUS_POSITION / (this.FOCUS_POSITION + axis.z);

        return {x : this.center.x + axis.x * scale, y : this.center.y - axis.y * scale, color : this.COLOR.replace('%hue', this.hue + theta)};
    }
};
$(function(){
    RENDERER.init(STRATEGY);
});

