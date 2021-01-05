var _ctx = "../";
// var _cts = "../../Build/";

require.config({
	waitSeconds : 600,
	baseUrl : "../../Build/",
	paths: {
		'Cesium': 'Cesium/Cesium',
		'CommonFunc': 'Autonomy/commonFunc',
		'Config': 'Autonomy/config',
		'Globe' : './',
	},
	shim: {
		Cesium: {
			exports: 'Cesium',
		},
		CommonFunc : {
			exports : 'CommonFunc'
		},
		Config : {
			exports : 'Config'
		}
	},

	map: {  
        '*': {  
            'css-loader': 'requirejs/require_css'  
        }  
    },

    nameConvert : function( dep ) {
        if( dep.length <= 4 ) return dep;
        var suffix = dep.substr( dep.length - 4 );
        if( suffix === '.css' ) {
            return "css-loader!" + dep;
        }
        return dep;
    },
});
