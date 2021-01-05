/*
* author: 赵雪丹
* description: 坐标分析-经纬度
* day: 2017-07-23
*/
define( [], function(){
CommonFunc = {
	/*
	 * 获取两点之间的距离，偏移角，俯仰角
	 * @method getDistanceAndAngle
	 * @param {Float} lon1-观测点
	 * @param {Float} lat1-目标点
	 * @return {object} 距离，偏移角，俯仰角
	 */
	getDistanceAndAngle:function(startpoint,endpoint) {
	    var lon1 = startpoint.lon;
	    var lat1 = startpoint.lat;
	    var alt1 = startpoint.alt;
	    var lon2 = endpoint.lon;
	    var lat2 = endpoint.lat;
	    var alt2 = endpoint.alt;
	    var m_difference = alt1 - alt2;
	    m_difference = Math.abs(m_difference);
	    var m_distance = this.getDistance(lon1, lat1, lon2, lat2);
	    var m_angle = this.getAngle(lon1, lat1, lon2, lat2);
	    var m_pitch = Math.atan(m_difference/m_distance);
	    m_pitch = this.deg(m_pitch);
	    if(alt1 > alt2){
	    	m_pitch = -m_pitch;
	    }
	    var m_obj = {distance:m_distance,angle:m_angle,pitch:m_pitch};
	    return m_obj;
	},
	
	/*
	 * 获取箭头顶点坐标集合
	 * @method getArrowPointList
	 * @param {Array} pointList-基准点集合
	 * @param {string} name（polygon：面，polyline：线）
	 * @param {string} type（basic：基础箭头，doubleTail：双尾箭头）
	 * @return {Array} m_array
	 */
	getArrowPointList:function(pointList,name,type){
		if(pointList.length < 2){
			return [];
		}
		var m_h = 2000;
		var m_ratio = 6;
		var m_min_width = 0;
		var m_distance = 0;
		for(var i = 1; i < pointList.length; i++){
			m_min_width = this.getDistance(pointList[i-1].lon, pointList[i-1].lat, pointList[i].lon, pointList[i].lat); 
			m_distance += m_min_width;
		}
		var m_width = m_distance/m_ratio;
		
		var m_leftList = [];
		var m_rightList = [];
		for(var i = 1; i < pointList.length; i++){
			var m_point_l,m_point_r;
			var m_b = pointList[i-1];
			var m_c = pointList[i];
			if(i == 1){
				var m_angle = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
				if(type == "basic" || type == "diagonal"){
					m_point_l = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle - 90, 0, m_width/2);
					m_point_r = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle + 90, 0, m_width/2);
				}else if(type == "doubleTail"){
					m_point_l = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle - 135, 0, m_width * 0.8);
					m_point_r = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle + 135, 0, m_width * 0.8);
				}
				m_leftList[m_leftList.length] = m_point_l;
				m_rightList[m_rightList.length] = m_point_r;
			}else{
				var m_a = pointList[i-2];
				var m_distance_ab = this.getDistance(m_a.lon, m_a.lat, m_b.lon, m_b.lat);
				var m_distance_bc = this.getDistance(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
				var m_angle_ab = this.getAngle(m_a.lon, m_a.lat, m_b.lon, m_b.lat);
				var m_angle_bc = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
				var m_angle_bx = 90 - (m_angle_bc - m_angle_ab + 180) / 2 + m_angle_bc;
				if(Math.abs(m_angle_ab - m_angle_bc) < 1 || m_width > m_min_width){
					m_point_l = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bx - 90, 0, m_width/2);
					m_leftList[m_leftList.length] = m_point_l;
					m_point_r = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bx + 90, 0, m_width/2);
					m_rightList[m_rightList.length] = m_point_r;
				}else{
					if(0 < m_angle_ab && m_angle_ab < 90){
						if(270 < m_angle_bc && m_angle_bc < 360){
							m_angle_bx = m_angle_bc -270 - (m_angle_bc - m_angle_ab - 180)/2;
						}
					}else if(90 < m_angle_ab && m_angle_ab  < 180){
						if(270 < m_angle_bc && m_angle_bc < 360){
							m_angle_bx = m_angle_bc -270 - (m_angle_bc - m_angle_ab - 180)/2;
						}
					}else if(180 < m_angle_ab && m_angle_ab  < 270){
						if(0 < m_angle_bc && m_angle_bc < 90){
							m_angle_bx = 270 + m_angle_bc + (m_angle_ab - m_angle_bc - 180)/2;
						}
					}else if(270 < m_angle_ab && m_angle_ab  < 360){
						if(0 < m_angle_bc && m_angle_bc < 90){
							m_angle_bx = 270 + m_angle_bc + (m_angle_ab - m_angle_bc - 180)/2;
						}
					}
					var m_point_a_l = this.destinationVincenty(m_a.lon, m_a.lat, m_h, m_angle_ab - 90, 0, m_width/2);
					var m_point_b_l = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bx - 90, 0, m_width/2);
					var m_point_c_l = this.destinationVincenty(m_point_b_l.lon, m_point_b_l.lat, m_h, m_angle_bc, 0, m_distance_bc);
					if(i == pointList.length - 1){
						var m_angle_ppp = this.getAngle(m_c.lon, m_c.lat, m_b.lon, m_b.lat);
						var m_width_ppp = m_width;
						if(m_width > m_min_width){
							m_width_ppp = m_min_width;
						}
						var m_point_ppp = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle_ppp, 0, m_width_ppp);
						if(type != "diagonal"){
							m_point_c_l = this.destinationVincenty(m_point_ppp.lon, m_point_ppp.lat, m_h, m_angle_bc - 90, 0, m_width/2);
						}else{
							m_point_c_l = this.destinationVincenty(m_point_ppp.lon, m_point_ppp.lat, m_h, m_angle_bc - 90, 0, m_width/8);
						}
					}
					var points_l = [m_point_a_l,m_point_b_l,m_point_c_l];
					var m_bseList_l = this.getBezier(points_l);
					//如果加入所有点，则会跳过右侧点集的倒数第二个点	手动加入则不会出现问题
					for(var k = 0; k < m_bseList_l.length - 1; k++){						
						m_leftList[m_leftList.length] = m_bseList_l[k];
					}
		//			m_leftList[m_leftList.length] = m_bseList_l[0];
		//			m_leftList[m_leftList.length] = m_bseList_l[1];
		//			m_leftList[m_leftList.length] = m_bseList_l[2];
		//			m_leftList[m_leftList.length] = m_bseList_l[3];
					
		//			m_leftList[m_leftList.length] = {lon: 128.25749041591797, lat: 42.01135539849414, alt: 2000};
		//			m_leftList[m_leftList.length] = {lon: 128.30075051974407, lat: 42.01297259038068, alt: 2000};
		//			m_leftList[m_leftList.length] = {lon: 128.34393537886922, lat: 42.00914597429182, alt: 2000};
		//			m_leftList[m_leftList.length] = {lon: 128.40888844388198, lat: 41.992601434708924, alt: 2000};
					
					var m_point_a_r = this.destinationVincenty(m_a.lon, m_a.lat, m_h, m_angle_ab + 90, 0, m_width/2);
					var m_point_b_r = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bx + 90, 0, m_width/2);
					var m_point_c_r = this.destinationVincenty(m_point_b_r.lon, m_point_b_r.lat, m_h, m_angle_bc, 0, m_distance_bc);
					if(i == pointList.length - 1){
						var m_angle_cb = this.getAngle(m_c.lon, m_c.lat, m_b.lon, m_b.lat);
						var m_width_a = m_width;
						if(m_width > m_min_width){
							m_width_a = m_min_width;
						}
						var m_point_a = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle_cb, 0, m_width_a);
						if(type != "diagonal"){
							m_point_c_r = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc + 90, 0, m_width/2);
						}else{
							m_point_c_r = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc + 90, 0, m_width/8);
						}
					}
					var points_r = [m_point_a_r,m_point_b_r,m_point_c_r];
					var m_bseList_r = this.getBezier(points_r);
					//同上
					for(var k = 0; k < m_bseList_r.length - 1; k++){
						m_rightList[m_rightList.length] = m_bseList_r[k];
					}
				}
			}
			if(i == pointList.length - 1){
				var m_angle_bc = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
				var m_angle_cb = this.getAngle(m_c.lon, m_c.lat, m_b.lon, m_b.lat);
				var m_width_a = m_width;
				if(m_width > m_min_width){
					m_width_a = m_min_width;
				}
				var m_point_a = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle_cb, 0, m_width_a);
				var m_l = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc - 90, 0, m_width/2);
				var m_ll = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc - 90, 0, m_width);
				var m_r = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc + 90, 0, m_width/2);
				var m_rr = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc + 90, 0, m_width);
				if(type == "diagonal"){
					m_l = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc - 90, 0, m_width/8);
					m_ll = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc - 90, 0, m_width/4);
					m_r = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc + 90, 0, m_width/8);
					m_rr = this.destinationVincenty(m_point_a.lon, m_point_a.lat, m_h, m_angle_bc + 90, 0, m_width/4);
				}
				m_leftList[m_leftList.length] = m_l;
				m_leftList[m_leftList.length] = m_ll;
				m_rightList[m_rightList.length] = m_r;
				m_rightList[m_rightList.length] = m_rr;
			}
		}
		var m_list = [];
		for(var i = 0; i < m_leftList.length; i++){
			m_list[m_list.length] = m_leftList[i];
		}
		m_list[m_list.length] = {lon:pointList[pointList.length-1].lon,lat:pointList[pointList.length-1].lat,alt:m_h};
		for(var i = m_rightList.length - 1; i >= 0; i--){
			m_list[m_list.length] = m_rightList[i];
		}
		if(type == "doubleTail" || type == "diagonal"){
			m_list[m_list.length] = {lon:pointList[0].lon,lat:pointList[0].lat,alt:m_h};
		}
		if(name == "polyline"){
	    	m_list[m_list.length] = m_leftList[0];
	    }
		var m_array = new Array();
	    for(var i = 0; i < m_list.length; i++){
	    	m_array.push(m_list[i].lon);
	    	m_array.push(m_list[i].lat);
	  		m_array.push(m_list[i].alt);
	    }
		return m_array;
	},
	
	/*
	 * 获取扑火线顶点坐标集合
	 * @method getBattleLinePointList
	 * @param {Array} pointList-基准点集合
	 * @return {Array} m_array
	 */
//	getBattleLinePointList:function(pointList){
//		if(pointList.length < 2){
//			return [];
//		}
//		var m_h = 2000;
//		var m_width = 30;
//		var m_dis = 300;
//		var m_leftList = [];
//		var m_rightList = [];
//		for(var i = 1; i < pointList.length; i++){
//			var m_b = pointList[i-1];
//			var m_c = pointList[i];
//			if(i == 1){
//				var m_kzList = [];
//				var m_distance = this.getDistance(m_b.lon,m_b.lat,m_c.lon,m_c.lat);
//				var m_angle = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
//				m_pstar = {lon:pointList[0].lon,lat:pointList[0].lat,alt:m_h};
//				m_leftList[m_leftList.length] = m_pstar;
//				var m_r1 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle + 90, 0, m_width);
//				m_rightList[m_rightList.length] = m_r1;
//				if(m_distance < 100){
//					m_kzList = [];
//				}else if(m_distance < m_dis*2){
//					var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle, 0, m_distance/2);
//					m_kzList[m_kzList.length] = m_kz;
//				}else{
//					var m_nun = parseInt((m_distance-200)/m_dis);
//					var m_dis_sy = m_distance - m_dis*m_nun;
//					var m_dis_se = m_dis_sy/2;
//					var p0 = Cesium.Cartesian3.fromDegrees(m_b.lon,m_b.lat,m_h);
//					var p1 = Cesium.Cartesian3.fromDegrees(m_c.lon,m_c.lat,m_h);
//					var direction = new Cesium.Cartesian3();
//					Cesium.Cartesian3.subtract(p1, p0, direction);
//				    Cesium.Cartesian3.normalize(direction, direction);
//				    var ray = new Cesium.Ray(p0, direction);
//					for(var k = 0; k <= m_nun; k++){
////						var m_kz_d = m_dis_se + m_dis*k;
////						var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle, 0, m_kz_d);
////						m_kzList[m_kzList.length] = m_kz;
//						
//						var m_kz_d = m_dis_se + m_dis*k;
//						var pt = Cesium.Ray.getPoint(ray, m_kz_d);
//						var cartographic = Cesium.Cartographic.fromCartesian(pt);
//						var longitude = Cesium.Math.toDegrees(cartographic.longitude);
//						var latitude = Cesium.Math.toDegrees(cartographic.latitude);
//						var height = cartographic.height;
//						var m_kz = {lon:longitude,lat:latitude,alt:height};
//						m_kzList.push(m_kz);
//					}
//				}
//				for(var k = 0; k < m_kzList.length; k++){
//					var m_p1,m_p2,m_p3,m_p4,m_p5,m_p6,m_p7;
//					m_p1 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle + 180, 0, 10);
//					m_p2 = this.destinationVincenty(m_p1.lon, m_p1.lat, m_h, m_angle - 90, 0, 30);
//					m_p3 = this.destinationVincenty(m_p2.lon, m_p2.lat, m_h, m_angle + 180, 0, 20);
//					m_p4 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle - 90, 0, 60);
//					m_p7 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle, 0, 10);
//					m_p6 = this.destinationVincenty(m_p7.lon, m_p7.lat, m_h, m_angle - 90, 0, 30);
//					m_p5 = this.destinationVincenty(m_p6.lon, m_p6.lat, m_h, m_angle, 0, 20);
//					m_leftList[m_leftList.length] = m_p1;
//					m_leftList[m_leftList.length] = m_p2;
//					m_leftList[m_leftList.length] = m_p3;
//					m_leftList[m_leftList.length] = m_p4;
//					m_leftList[m_leftList.length] = m_p5;
//					m_leftList[m_leftList.length] = m_p6;
//					m_leftList[m_leftList.length] = m_p7;
//					
//					var m_p8 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle + 90, 0, m_width);
//					m_rightList[m_rightList.length] = m_p8;
//				}
//				m_pend = {lon:pointList[1].lon,lat:pointList[1].lat,alt:m_h};
//				m_leftList[m_leftList.length] = m_pend;
//				var m_r2 = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle + 90, 0, m_width);
//				m_rightList[m_rightList.length] = m_r2;
//			}else{
//				var m_a = pointList[i-2];
//				var m_angle_ab = this.getAngle(m_a.lon, m_a.lat, m_b.lon, m_b.lat);
//				var m_angle_bc = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
//				var m_angle_bx = 90 - (m_angle_bc - m_angle_ab + 180) / 2 + m_angle_bc;
//				
//				var m_r1 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bc + 90, 0, m_width);
//				m_rightList[m_rightList.length] = m_r1;
//				
//				if(0 < m_angle_ab && m_angle_ab < 90){
//					if(270 < m_angle_bc && m_angle_bc < 360){
//						m_angle_bx = m_angle_bc -270 - (m_angle_bc - m_angle_ab - 180)/2;
//					}
//				}else if(90 < m_angle_ab && m_angle_ab  < 180){
//					if(270 < m_angle_bc && m_angle_bc < 360){
//						m_angle_bx = m_angle_bc -270 - (m_angle_bc - m_angle_ab - 180)/2;
//					}
//				}else if(180 < m_angle_ab && m_angle_ab  < 270){
//					if(0 < m_angle_bc && m_angle_bc < 90){
//						m_angle_bx = 270 + m_angle_bc + (m_angle_ab - m_angle_bc - 180)/2;
//					}
//				}else if(270 < m_angle_ab && m_angle_ab  < 360){
//					if(0 < m_angle_bc && m_angle_bc < 90){
//						m_angle_bx = 270 + m_angle_bc + (m_angle_ab - m_angle_bc - 180)/2;
//					}
//				}
//				console.log("ab:"+m_angle_ab+",bc:"+m_angle_bc+",bx:"+m_angle_bx);
//				var m_kzList = [];
//				var m_distance = this.getDistance(m_b.lon,m_b.lat,m_c.lon,m_c.lat);
//				if(m_distance < 100){
//					m_kzList = [];
//				}else if(m_distance < m_dis*2){
//					var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bc, 0, m_distance/2);
//					m_kzList[m_kzList.length] = m_kz;
//				}else{
//					var m_nun = parseInt((m_distance-200)/m_dis);
//					var m_dis_sy = m_distance - m_dis*m_nun;
//					var m_dis_se = m_dis_sy/2;
//					var p0 = Cesium.Cartesian3.fromDegrees(m_b.lon,m_b.lat,m_h);
//					var p1 = Cesium.Cartesian3.fromDegrees(m_c.lon,m_c.lat,m_h);
//					var direction = new Cesium.Cartesian3();
//					Cesium.Cartesian3.subtract(p1, p0, direction);
//				    Cesium.Cartesian3.normalize(direction, direction);
//				    var ray = new Cesium.Ray(p0, direction);
//					for(var k = 0; k <= m_nun; k++){
////						var m_kz_d = m_dis_se + m_dis*k;
////						var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bc, 0, m_kz_d);
////						m_kzList[m_kzList.length] = m_kz;
//						
//						var m_kz_d = m_dis_se + m_dis*k;
//						var pt = Cesium.Ray.getPoint(ray, m_kz_d);
//						var cartographic = Cesium.Cartographic.fromCartesian(pt);
//						var longitude = Cesium.Math.toDegrees(cartographic.longitude);
//						var latitude = Cesium.Math.toDegrees(cartographic.latitude);
//						var height = cartographic.height;
//						var m_kz = {lon:longitude,lat:latitude,alt:height};
//						m_kzList.push(m_kz);
//					}
//				}
//				for(var k = 0; k < m_kzList.length; k++){
//					var m_p1,m_p2,m_p3,m_p4,m_p5,m_p6,m_p7;
//					m_p1 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle_bc + 180, 0, 10);
//					m_p2 = this.destinationVincenty(m_p1.lon, m_p1.lat, m_h, m_angle_bc - 90, 0, 30);
//					m_p3 = this.destinationVincenty(m_p2.lon, m_p2.lat, m_h, m_angle_bc + 180, 0, 20);
//					m_p4 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle_bc - 90, 0, 60);
//					m_p7 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle_bc, 0, 10);
//					m_p6 = this.destinationVincenty(m_p7.lon, m_p7.lat, m_h, m_angle_bc - 90, 0, 30);
//					m_p5 = this.destinationVincenty(m_p6.lon, m_p6.lat, m_h, m_angle_bc, 0, 20);
//					m_leftList[m_leftList.length] = m_p1;
//					m_leftList[m_leftList.length] = m_p2;
//					m_leftList[m_leftList.length] = m_p3;
//					m_leftList[m_leftList.length] = m_p4;
//					m_leftList[m_leftList.length] = m_p5;
//					m_leftList[m_leftList.length] = m_p6;
//					m_leftList[m_leftList.length] = m_p7;
//					
//					var m_p8 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle_bc + 90, 0, m_width);
//					m_rightList[m_rightList.length] = m_p8;
//				}
//				m_pend = {lon:pointList[i].lon,lat:pointList[i].lat,alt:m_h};
//				m_leftList[m_leftList.length] = m_pend;
//				var m_r2 = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle_bc + 90, 0, m_width);
//				m_rightList[m_rightList.length] = m_r2;
//			}
//		}
//		
//		var m_list = [];
//		for(var i = 0; i < m_leftList.length; i++){
//			m_list[m_list.length] = m_leftList[i];
//		}
//		for(var i = m_rightList.length - 1; i >= 0; i--){
//			m_list[m_list.length] = m_rightList[i];
//		}
//		var m_array = new Array();
//	    for(var i = 0; i < m_list.length; i++){
//	    	m_array.push(m_list[i].lon);
//	    	m_array.push(m_list[i].lat);
//	  		m_array.push(m_list[i].alt);
//	    }
//		return m_array;
//	},
	
	/*
	 * 获取隔离带顶点坐标集合
	 * @method getIsolationBeltPointList
	 * @param {Array} pointList-基准点集合
	 * @return {Array} m_array
	 */
//	getIsolationBeltPointList:function(pointList){
//		var m_h = 2000;
//		var m_width = 20;
//		var m_height = 50;
//		var m_dis = 300;
//		var m_leftHatList = [];
//		var m_rightHatList = [];
//		var m_leftList = [];
//		var m_rightList = [];
//		if(pointList.length < 2){
//			return {vertexList:[],vertexListHat:[]};
//		}else if(pointList.length == 2){
//			var m_b = pointList[0];
//			var m_c = pointList[1];
//			var m_kzList = [];
//			var m_distance = this.getDistance(m_b.lon,m_b.lat,m_c.lon,m_c.lat);
//			var m_angle = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
//			var m_pstar = {lon:m_b.lon,lat:m_b.lat,alt:m_h};
//			var m_pstar1 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle - 90, 0, m_height);
//			var m_pstar2 = this.destinationVincenty(m_pstar1.lon, m_pstar1.lat, m_h, m_angle - 135, 0, m_width);
//			var m_pstar3 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle + 135, 0, m_width);
//			m_leftList[m_leftList.length] = m_pstar2;
//			m_leftList[m_leftList.length] = m_pstar1;
//			m_leftList[m_leftList.length] = m_pstar;
//			m_rightList[m_rightList.length] = m_pstar3;
//			m_leftHatList[m_leftHatList.length] = m_pstar2;
//			m_rightHatList[m_rightHatList.length] = m_pstar1;
//			if(m_distance < 100){
//				m_kzList = [];
//			}else if(m_distance < m_dis*2){
//				var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle, 0, m_distance/2);
//				m_kzList[m_kzList.length] = m_kz;
//			}else{
//				var m_nun = parseInt((m_distance-200)/m_dis);
//				var m_dis_sy = m_distance - m_dis*m_nun;
//				var m_dis_se = m_dis_sy/2;
//				for(var k = 0; k <= m_nun; k++){
//					var m_kz_d = m_dis_se + m_dis*k;
//					var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle, 0, m_kz_d);
//					m_kzList[m_kzList.length] = m_kz;
//				}
//			}
//			for(var k = 0; k < m_kzList.length; k++){
//				var m_p1 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle + 180, 0, m_width);
//				var m_p2 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle - 90, 0, m_height);
//				var m_p3 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle, 0, m_width);
//				m_leftList[m_leftList.length] = m_p1;
//				m_leftList[m_leftList.length] = m_p2;
//				m_leftList[m_leftList.length] = m_p3;
//				m_rightHatList[m_rightHatList.length] = m_p2;
//			}
//			var m_pend = {lon:m_c.lon,lat:m_c.lat,alt:m_h};
//			var m_pstar4 = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle + 45, 0, m_width);
//			var m_pstar6 = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle - 90, 0, m_height);
//			var m_pstar5 = this.destinationVincenty(m_pstar6.lon, m_pstar6.lat, m_h, m_angle - 45, 0, m_width);
//			m_leftList[m_leftList.length] = m_pend;
//			m_leftList[m_leftList.length] = m_pstar6;
//			m_leftList[m_leftList.length] = m_pstar5;
//			m_rightList[m_rightList.length] = m_pstar4;
//			m_leftHatList[m_leftHatList.length] = m_pstar5;
//			m_rightHatList[m_rightHatList.length] = m_pstar6;
//		}else{
//			for(var i = 1; i < pointList.length; i++){
//				var m_b = pointList[i-1];
//				var m_c = pointList[i];
//				if(i == 1){
//					var m_angle = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
//					var m_pstar = {lon:m_b.lon,lat:m_b.lat,alt:m_h};
//					var m_pstar1 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle - 90, 0, m_height);
//					var m_pstar2 = this.destinationVincenty(m_pstar1.lon, m_pstar1.lat, m_h, m_angle - 135, 0, m_width);
//					var m_pstar3 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle + 135, 0, m_width);
//					m_leftList[m_leftList.length] = m_pstar2;
//					m_leftList[m_leftList.length] = m_pstar1;
//					m_leftList[m_leftList.length] = m_pstar;
//					m_rightList[m_rightList.length] = m_pstar3;
//					m_leftHatList[m_leftHatList.length] = m_pstar2;
//					m_rightHatList[m_rightHatList.length] = m_pstar1;
//					var m_kzList = [];
//					var m_distance = this.getDistance(m_b.lon,m_b.lat,m_c.lon,m_c.lat);
//					if(m_distance < 100){
//						m_kzList = [];
//					}else if(m_distance < m_dis*2){
//						var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle, 0, m_distance/2);
//						m_kzList[m_kzList.length] = m_kz;
//					}else{
//						var m_nun = parseInt((m_distance-200)/m_dis);
//						var m_dis_sy = m_distance - m_dis*m_nun;
//						var m_dis_se = m_dis_sy/2;
//						for(var k = 0; k <= m_nun; k++){
//							var m_kz_d = m_dis_se + m_dis*k;
//							var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle, 0, m_kz_d);
//							m_kzList[m_kzList.length] = m_kz;
//						}
//					}
//					for(var k = 0; k < m_kzList.length; k++){
//						var m_p1 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle + 180, 0, m_width);
//						var m_p2 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle - 90, 0, m_height);
//						var m_p3 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle, 0, m_width);
//						m_leftList[m_leftList.length] = m_p1;
//						m_leftList[m_leftList.length] = m_p2;
//						m_leftList[m_leftList.length] = m_p3;
////						m_rightHatList[m_rightHatList.length] = m_p2;
//					}
//					var m_pend = {lon:m_c.lon,lat:m_c.lat,alt:m_h};
//					var m_pstar4 = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle + 90, 0, m_width);
//					m_leftList[m_leftList.length] = m_pend;
//					m_rightList[m_rightList.length] = m_pstar4;
//				}else{
//					var m_a = pointList[i-2];
//					var m_angle_ab = this.getAngle(m_a.lon, m_a.lat, m_b.lon, m_b.lat);
//					var m_angle_bc = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
//					var m_angle_bx = 90 - (m_angle_bc - m_angle_ab + 180) / 2 + m_angle_bc;
//					if(0 < m_angle_ab && m_angle_ab < 90){
//						if(270 < m_angle_bc && m_angle_bc < 360){
//							m_angle_bx = m_angle_bc -270 - (m_angle_bc - m_angle_ab - 180)/2;
//						}
//					}else if(90 < m_angle_ab && m_angle_ab  < 180){
//						if(270 < m_angle_bc && m_angle_bc < 360){
//							m_angle_bx = m_angle_bc -270 - (m_angle_bc - m_angle_ab - 180)/2;
//						}
//					}else if(180 < m_angle_ab && m_angle_ab  < 270){
//						if(0 < m_angle_bc && m_angle_bc < 90){
//							m_angle_bx = 270 + m_angle_bc + (m_angle_ab - m_angle_bc - 180)/2;
//						}
//					}else if(270 < m_angle_ab && m_angle_ab  < 360){
//						if(0 < m_angle_bc && m_angle_bc < 90){
//							m_angle_bx = 270 + m_angle_bc + (m_angle_ab - m_angle_bc - 180)/2;
//						}
//					}
//					var m_pstar = {lon:m_b.lon,lat:m_b.lat,alt:m_h};
//					var m_pstar1 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bx - 90, 0, m_height);
//					var m_pstar2 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bx - 90, 0, m_height + m_width);
//					var m_pstar3 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bc + 90, 0, m_width);
//					m_rightList[m_rightList.length] = m_pstar3;
//					m_leftHatList[m_leftHatList.length] = m_pstar2;
//					m_rightHatList[m_rightHatList.length] = m_pstar1;
//					var m_kzList = [];
//					var m_distance = this.getDistance(m_b.lon,m_b.lat,m_c.lon,m_c.lat);
//					if(m_distance < 100){
//						m_kzList = [];
//					}else if(m_distance < m_dis*2){
//						var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bc, 0, m_distance/2);
//						m_kzList[m_kzList.length] = m_kz;
//					}else{
//						var m_nun = parseInt((m_distance-200)/m_dis);
//						var m_dis_sy = m_distance - m_dis*m_nun;
//						var m_dis_se = m_dis_sy/2;
//						for(var k = 0; k <= m_nun; k++){
//							var m_kz_d = m_dis_se + m_dis*k;
//							var m_kz = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bc, 0, m_kz_d);
//							m_kzList[m_kzList.length] = m_kz;
//						}
//					}
//					for(var k = 0; k < m_kzList.length; k++){
//						var m_p1 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle_bc + 180, 0, m_width);
//						var m_p2 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle_bc - 90, 0, m_height);
//						var m_p3 = this.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle_bc, 0, m_width);
//						m_leftList[m_leftList.length] = m_p1;
//						m_leftList[m_leftList.length] = m_p2;
//						m_leftList[m_leftList.length] = m_p3;
////						m_rightHatList[m_rightHatList.length] = m_p2;
//					}
//					if(i == pointList.length - 1){
//						var m_pend = {lon:m_c.lon,lat:m_c.lat,alt:m_h};
//						var m_pstar4 = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle_bc + 45, 0, m_width);
//						var m_pstar6 = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle_bc - 90, 0, m_height);
//						var m_pstar5 = this.destinationVincenty(m_pstar6.lon, m_pstar6.lat, m_h, m_angle_bc - 45, 0, m_width);
//						m_leftList[m_leftList.length] = m_pend;
//						m_leftList[m_leftList.length] = m_pstar6;
//						m_leftList[m_leftList.length] = m_pstar5;
//						m_rightList[m_rightList.length] = m_pstar4;
//						m_leftHatList[m_leftHatList.length] = m_pstar5;
//						m_rightHatList[m_rightHatList.length] = m_pstar6;
//					}else{
//						var m_pend = {lon:m_c.lon,lat:m_c.lat,alt:m_h};
//						var m_pstar4 = this.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle_bc + 90, 0, m_width);
//						m_leftList[m_leftList.length] = m_pend;
//						m_rightList[m_rightList.length] = m_pstar4;
//					}
//				}
//			}
//		}
//		var m_list = [];
//		for(var i = 0; i < m_leftList.length; i++){
//			m_list[m_list.length] = m_leftList[i];
//		}
//		for(var i = m_rightList.length - 1; i >= 0; i--){
//			m_list[m_list.length] = m_rightList[i];
//		}
//		var m_array = new Array();
//	    for(var i = 0; i < m_list.length; i++){
//	    	m_array.push(m_list[i].lon);
//	    	m_array.push(m_list[i].lat);
//	  		m_array.push(m_list[i].alt);
//	    }
//		var m_listHat = [];
//		for(var i = 0; i < m_leftHatList.length; i++){
//			m_listHat[m_listHat.length] = m_leftHatList[i];
//		}
//		for(var i = m_rightHatList.length - 1; i >= 0; i--){
//			m_listHat[m_listHat.length] = m_rightHatList[i];
//		}
//		var m_arrayHat = new Array();
//	    for(var i = 0; i < m_listHat.length; i++){
//	    	m_arrayHat.push(m_listHat[i].lon);
//	    	m_arrayHat.push(m_listHat[i].lat);
//	  		m_arrayHat.push(m_listHat[i].alt);
//	    }
//		return {vertexList:m_array,vertexListHat:m_arrayHat};
//	},
	
	/*
	 * 获取贝塞尔曲线顶点坐标集合
	 * @method getBezier
	 * @param {Array} points-控制点集合
	 * @return {Array} m_list-插值点集合
	 */
	getBezier:function(points){
		var m_list = [];
		var m_h = 2000;
		var m_a = points[0];
		var m_b = points[1];
		var m_c = points[2];
		var m_angle_ab = this.getAngle(m_a.lon, m_a.lat, m_b.lon, m_b.lat);
		var m_angle_bc = this.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
		var m_angle_ac = this.getAngle(m_a.lon, m_a.lat, m_c.lon, m_c.lat);
		var m_distance_ab = this.getDistance(m_a.lon, m_a.lat, m_b.lon, m_b.lat); 
		var m_distance_bc = this.getDistance(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
		var m_n = 50;
		var m_q = m_angle_ac - m_angle_ab;
		var pinBuilder = new Cesium.PinBuilder();
		for(var i = 2; i < m_n; i++){
			var m_a1 = this.destinationVincenty(m_a.lon, m_a.lat, m_h, m_angle_ab, 0, m_distance_ab * (i-1)/m_n);
			var m_a2 = this.destinationVincenty(m_a.lon, m_a.lat, m_h, m_angle_ab, 0, m_distance_ab * i/m_n);
			var m_b1 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bc, 0, m_distance_bc * (i-1)/m_n);
			var m_b2 = this.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle_bc, 0, m_distance_bc * i/m_n);
			var x0 = m_a1.lon;
			var y0 = m_a1.lat;
			var x1 = m_b1.lon;
			var y1 = m_b1.lat;
			var x2 = m_a2.lon;
			var y2 = m_a2.lat;
			var x3 = m_b2.lon;
			var y3 = m_b2.lat;
			var k1=(y0-y1)/(x0-x1);
			var k2=(y2-y3)/(x2-x3);
			var x=(k1*x0-k2*x2+y2-y0)/(k1-k2);
			var y=y0+(x-x0)*k1;
			m_list[m_list.length] = {lon:x,lat:y,alt:m_h};
		}
		m_list[m_list.length] = m_c; 
		return m_list;
	},
	
	/*
	 * 获取两点之间的球面距离
	 * @method getDistance
	 * @param {Float} lon1-观测点经度
	 * @param {Float} lat1-观测点纬度
	 * @param {Float} lon2-目标点经度
	 * @param {Float} lat2-目标点纬度
	 * @return {Float} s
	 */
	getDistance:function(lon1, lat1, lon2, lat2) {
	    var radLat1 = lat1 * Math.PI / 180.0;
	    var radLat2 = lat2 * Math.PI / 180.0;
	    var a = radLat1 - radLat2;
	    var b = lon1 * Math.PI / 180.0 - lon2 * Math.PI / 180.0;
	    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
	    s = s * 6378.137;
	    s = Math.round(s * 10000) / 10000;
	    return s * 1000;
	},
	/*
	 * 获取两点之间的直线距离
	 * @method getDistanceByline
	 * @param {Float} lon1-观测点经度
	 * @param {Float} lat1-观测点纬度
	 * @param {Float} lon2-目标点经度
	 * @param {Float} lat2-目标点纬度
	 * @return {Float} s
	 */
	getDistanceByline:function(lon1, lat1, lon2, lat2) {
	    var f = this.rad((lat1 + lat2)/2);     
	     var g = this.rad((lat1 - lat2)/2);     
	     var l = this.rad((lon1 - lon2)/2);     
	     var sg = Math.sin(g);     
	     var sl = Math.sin(l);     
	     var sf = Math.sin(f);     
	     var s,c,w,r,d,h1,h2;     
	     var a = 6378137.0;//The Radius of eath in meter.   
	     var fl = 1/298.257;     
	     sg = sg*sg;     
	     sl = sl*sl;     
	     sf = sf*sf;     
	     s = sg*(1-sl) + (1-sf)*sl;     
	     c = (1-sg)*(1-sl) + sf*sl;     
	     w = Math.atan(Math.sqrt(s/c));     
	     r = Math.sqrt(s*c)/w;     
	     d = 2*w*a;     
	     h1 = (3*r -1)/2/c;     
	     h2 = (3*r +1)/2/s;     
	     s = d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));   
//	     s = s/1000;   
//	     s = s.toFixed(2);//指定小数点后的位数。   
	     return s; 
	},
	/*
	 * 经纬度转笛卡尔
	 * @method getCartesian
	 * @param {Float} lon-经度
	 * @param {Float} lat-纬度
	 * @return {Object} {x:x,y:y,z:z}
	 */
	getCartesian:function(lon,lat){
//			var positions = Cesium.Cartesian3.fromDegreesArray([parseFloat(lon), parseFloat(lat)]);
//			return positions;
		var R = 6378137;
		var x=Math.cos(this.rad(lat))*Math.cos(this.rad(lon))*R;
		var y=Math.sin(this.rad(lon))*Math.cos(this.rad(lat))*R;
		var z=Math.sin(this.rad(lat))*R;
		return {x:x,y:y,z:z};
	},
	/*
	 * 计算通过地球表面三点的大圆（三点使用笛卡尔坐标系）
	 * @method getCircle
	 * @param {Object} pt1-pt2-pt3
	 * @return {Object} {a:a,b:b,c:c}
	 */
	getCircle:function(pt1,pt2,pt3){
		var a=(pt2.y-pt1.y)*(pt3.z-pt1.z)-(pt3.y-pt1.y)*(pt2.z-pt1.z);
		var b=(pt2.z-pt1.z)*(pt3.x-pt1.x)-(pt3.z-pt1.z)*(pt2.x-pt1.x);
		var c=(pt2.x-pt1.x)*(pt3.y-pt1.y)-(pt3.x-pt1.x)*(pt2.y-pt1.y);
		return {a:a,b:b,c:c};
	},
	
	/*
	 * 获取两点之间连线与北向的角度ByCircle
	 * @method getAngleByCircle
	 * @param {Float} lon1-观测点经度
	 * @param {Float} lat1-观测点纬度
	 * @param {Float} lon2-目标点经度
	 * @param {Float} lat2-目标点纬度
	 * @return {Float} azimuth
	 */
	getAngleByCircle:function(lon1, lat1, lon2, lat2) {
		//		cosφ=(A1A2+B1B2+C1C2)/[√(A1²+B1²+C1²)√(A2²+B2²+C2²)]
		var azimuth = 0;
		if(lat1-lat2==0) {
			azimuth=90;
		} else {
	        var pt1 = this.getCartesian(lon1,lat1);
			var pt2 = this.getCartesian(lon2,lat2);
			var ch_lon = (lon2 - lon1)/2;
			var ch_lat = (lat2 - lat1)/2;
			var pt3 = this.getCartesian(lon1+ch_lon,lat1+ch_lat);
			var pt4 = pt1;
			var pt5 = this.getCartesian(0,90);
			var pt6 = this.getCartesian(0,0);
			var abc1 = this.getCircle(pt1,pt2,pt3);
			var abc2 = this.getCircle(pt4,pt5,pt6);
			var f = (abc1.a*abc2.a+abc1.b*abc2.b+abc1.c*abc2.c)/(Math.sqrt(abc1.a*abc1.a+abc1.b*abc1.b+abc1.c*abc1.c)*Math.sqrt(abc2.a*abc2.a+abc2.b*abc2.b+abc2.c*abc2.c));
			azimuth = this.deg(Math.acos(f));
	    }
		if (lat1 > lat2) {
	    	azimuth = azimuth + 180;
	    }
	    if (azimuth < 0) { 
	    	azimuth = 360 + azimuth; 
	    }
		return azimuth;
	},
	
	/*
	 * 获取两点之间连线与北向的角度
	 * @method getAngle
	 * @param {Float} lon1-观测点经度
	 * @param {Float} lat1-观测点纬度
	 * @param {Float} lon2-目标点经度
	 * @param {Float} lat2-目标点纬度
	 * @return {Float} azimuth
	 */
	getAngle:function(lon1, lat1, lon2, lat2) {
		var azimuth = 0;
		var averageLat=(lat1+lat2)/2;
		if(lat1-lat2==0) { 
			azimuth=90;
		} else {
	        azimuth = Math.atan((lon1 - lon2) * Math.cos(this.rad(averageLat)) / (lat1 - lat2)) * 180 / Math.PI;
	    }
	    if (lat1 > lat2) {
	    	azimuth = azimuth + 180;
	    }
	    if (azimuth < 0) { 
	    	azimuth = 360 + azimuth; 
	    }
		return azimuth;
	},
	
	/*
	 * 获取两点之间连线与北向的角度ByMercator(墨卡托投影可保证球表面线段夹角不变，推荐使用)
	 * @method getAngleByMercator
	 * @param {Float} lon1-观测点经度
	 * @param {Float} lat1-观测点纬度
	 * @param {Float} lon2-目标点经度
	 * @param {Float} lat2-目标点纬度
	 * @return {Float} azimuth
	 */
	getAngleByMercator:function(lon1, lat1, lon2, lat2) {
		var o = this.lonLat2Mercator(lon1,lat1);
		var e = this.lonLat2Mercator(lon2,lat2);
		var s = this.lonLat2Mercator(lon1,lat1+1);
		var cosfi = 0, fi = 0, norm = 0;
		var dsx = s.X - o.X;
		var dsy = s.Y - o.Y;
		var dex = e.X - o.X;
		var dey = e.Y - o.Y;
		cosfi = dsx * dex + dsy * dey;
		norm = (dsx * dsx + dsy * dsy) * (dex * dex + dey * dey);
		cosfi /= Math.sqrt(norm);
		if (cosfi >= 1.0) return 0;
		if (cosfi <= -1.0) return Math.PI;
		fi = Math.acos(cosfi);
		if (180 * fi / Math.PI < 180)     
		{
		    return 180 * fi / Math.PI;
		}
		else
		{
		    return 360 - 180 * fi / Math.PI;
		}
	},
	
	/*
	 * 获取目标点
	 * @method destinationVincenty
	 * @param {Float} lon-经度
	 * @param {Float} lat-纬度
	 * @param {Float} alt-高程
	 * @param {Float} brng-水平角
	 * @param {Float} pitch-俯仰角
	 * @param {Float} dist-距离
	 * @return {Object} lonlat
	 */
	destinationVincenty:function(lon, lat, alt, brng, pitch, dist) {
	    var a = 6378137, b = 6356752.3142, f = 1/298.257223563;
	    var lon1 = lon;
	    var lat1 = lat;
	    var s = dist;
	    var alpha1 = this.rad(brng);
	    var sinAlpha1 = Math.sin(alpha1);
	    var cosAlpha1 = Math.cos(alpha1);
	    var tanU1 = (1-f) * Math.tan(this.rad(lat1));
	    var cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1*cosU1;
	    var sigma1 = Math.atan2(tanU1, cosAlpha1);
	    var sinAlpha = cosU1 * sinAlpha1;
	    var cosSqAlpha = 1 - sinAlpha*sinAlpha;
	    var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
	    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
	    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
	    var sigma = s / (b*A), sigmaP = 2*Math.PI;
	    while (Math.abs(sigma-sigmaP) > 1e-12) {
	        var cos2SigmaM = Math.cos(2*sigma1 + sigma);
	        var sinSigma = Math.sin(sigma);
	        var cosSigma = Math.cos(sigma);
	        var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
	            B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
	        sigmaP = sigma;
	        sigma = s / (b*A) + deltaSigma;
	    }
	    var tmp = sinU1*sinSigma - cosU1*cosSigma*cosAlpha1;
	    var lat2 = Math.atan2(sinU1*cosSigma + cosU1*sinSigma*cosAlpha1,
	        (1-f)*Math.sqrt(sinAlpha*sinAlpha + tmp*tmp));
	    var lambda = Math.atan2(sinSigma*sinAlpha1, cosU1*cosSigma - sinU1*sinSigma*cosAlpha1);
	    var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
	    var L = lambda - (1-C) * f * sinAlpha *
	        (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
	    var revAz = Math.atan2(sinAlpha, -tmp);  // final bearing
	    var o = (dist*180)/(Math.PI*a);
	    var p = 90 - o - pitch;
	    var op = (alt+a)*Math.sin(this.rad(pitch+90))/Math.sin(this.rad(p));
	    var m_alt = op - a;
//		var m_alt = alt +  dist * Math.tan(this.rad(pitch));
		var lonlat = {lon:lon1+this.deg(L),lat:this.deg(lat2),alt:m_alt};
	    return lonlat;
	},
	
	/**
	 * 度换成弧度
	 * @param  {Float} d  度
	 * @return {Float}   弧度
	 */
	rad:function(d) {
	   return d * Math.PI / 180.0;
	},
	
	/**
	 * 弧度换成度
	 * @param  {Float} x 弧度
	 * @return {Float}   度
	 */
	deg:function(x) {
	    return x*180/Math.PI;
	},
	
	/**
	 * 度换成度分秒
	 * @param  {Float} value  度
	 * @return {string}   度分秒
	 */
	formatDegree:function(value){
		var str = "";
		if(value < 0){
			str = '-';  
		}
		value = Math.abs(value);  
		var v1 = Math.floor(value);//度  
		var v2 = Math.floor((value - v1) * 60);//分  
		var v22 = v2;
		if(v2 < 10){
			v22 = "0" + v2;
		}
		var v3 = ((value - v1) * 60 - v2) * 60;//秒  
		var v33 = v3;
		if(v3 < 10){
			v33 = "0" + v3;
		}
		var vla = str + v1 + '°' + v22 + '\'' + v33 + '"';  
		var m_obj = {d:parseInt(str + v1), f:parseInt(v2), m:v3, value:vla};
		return m_obj;  
	},
	
	/**
	 * 度分秒换成度
	 * @param  {string} value  度分秒
	 * @return {Float}   度
	 */
	degreeConvertBack:function(value){
	//	var du = value.split("°")[0];  
	//  var fen = value.split("°")[1].split("'")[0];  
	//  var miao = value.split("°")[1].split("'")[1].split('"')[0]; 
		var du = value.d;  
	    var fen = value.f;  
	    var miao = value.m; 
	    var ret = Math.abs(du) + (Math.abs(fen)/60 + Math.abs(miao)/3600)
	    if(du < 0){
	    	ret = -(Math.abs(du) + (Math.abs(fen)/60 + Math.abs(miao)/3600));
	    }
		return ret;
	},
	//经纬度转墨卡托
    lonLat2Mercator:function(lon,lat)
    {
        var x = lon * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return {X:x,Y:y};
    },
    //墨卡托转经纬度
    Mercator2lonLat:function(point)
    {
        var x = point.x / 20037508.34 * 180;
        var y = point.y / 20037508.34 * 180;
        y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
        return {lon:x,lat:y};
    },
	//是否在中国范围内
	outOfChina:function(lon,lat){
		if (lon < 72.004 || lon > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
	},
	//
	transformLat:function(x,y){
		var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
                + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
        return ret;
	},
	//
	transformLon:function(x,y){
		var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
                * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0
                * Math.PI)) * 2.0 / 3.0;
        return ret;
	},
	//
	transform:function(lon,lat){
		if (this.outOfChina(lon,lat)) {
            return {lon:lon,lat:lat};
        }
		var a = 6378245.0;
		var ee = 0.00669342162296594323;
        var dLat = this.transformLat(lon - 105.0, lat - 35.0);
        var dLon = this.transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * Math.PI;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
        var mgLat = lat + dLat;
        var mgLon = lon + dLon;
        return {lon:mgLon,lat:mgLat};
	},
	//经纬度转火星坐标
	gps84_To_Gcj02:function(lon,lat){
		if (this.outOfChina(lon,lat)) {
            return null;
        }
		var a = 6378245.0;
		var ee = 0.00669342162296594323;
		var dLat = this.transformLat(lon - 105.0, lat - 35.0);
        var dLon = this.transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * Math.PI;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
        var mgLat = lat + dLat;
        var mgLon = lon + dLon;
        return {lon:mgLon,lat:mgLat};
	},
	//火星坐标转经纬度
	gcj02_To_Gps84:function(lon,lat){
		var gps = this.transform(lon,lat);
        var lontitude = lon * 2 - gps.lon;
        var latitude = lat * 2 - gps.lat;
        return {lon:lontitude,lat:latitude};
	},
	//火星坐标转百度坐标
	gcj02_To_Bd09:function(gg_lon,gg_lat){
		var x = gg_lon, y = gg_lat;
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * Math.PI);
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * Math.PI);
        var bd_lon = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return {lon:bd_lon,lat:bd_lat};
	},
	//百度坐标转火星坐标
	bd09_To_Gcj02:function(bd_lon,bd_lat){
		var x = bd_lon - 0.0065, y = bd_lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI);
        var gg_lon = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return {lon:gg_lon,lat:gg_lat};
	},
	//经纬度转百度坐标
	gps84_To_Bd09:function(lon,lat){
		var gcj02 = this.gps84_To_Gcj02(lon,lat);
		var bd09 = this.gcj02_To_Bd09(gcj02.lon,gcj02.lat);
		return bd09;
	},
	//百度坐标转经纬度
	bd09_To_Gps84:function(bd_lon,bd_lat){
		var gcj02 = this.bd09_To_Gcj02(bd_lon,bd_lat);
        var map84 = this.gcj02_To_Gps84(gcj02.lon, gcj02.lat);
        return map84;
	}
}
return CommonFunc;
});