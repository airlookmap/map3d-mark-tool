import { BASE_CONFIG } from '../config';

const sceneConfig = BASE_CONFIG().sceneConfig;

export const initScene = async function(sceneData) {
  console.log('initSceneData', sceneData);
  return new Promise((resolve, reject) => {
    try {
      // 移除旧 script
      let old = document.querySelector('#amap');
      if (old) old.parentNode.removeChild(old);

      const s = document.createElement("script");
      // var url = window.location.host;
      s.src = sceneConfig.scriptSrc;
      s.id = "amap";
      document.body.appendChild(s);

      s.onload = () => {
        try {
          const _map = window.map;
          if (_map && _map.destroy && !_map.destroyed) _map.destroy();
          const map = window.map = new AirlookMap.Map('container');
          map.skySphere.show = false;
          // map.mask = false;
          // 关闭标注点聚合效果
          map.scene.markerCluster.enabled = false;
          map.readyPromise.then((view) => {
            const res = view.setView({
              center: AirlookMap.Cartographic.fromDegrees(
                Number(sceneData.longitude),
                Number(sceneData.latitude),
                Number(sceneData.height) + 300
              ),
              radius: 300, // 取值范围（0.05km - 5km）
              maxCameraHeight: 800
            });

            console.log(res);
            resolve(res);
          });
          map.collisionDetection = true; //碰撞检测
          map.tileset.requestAreaData = false;
        } catch (error) {
          reject(error)
        }
      };

      s.onerror = (e) => {
        reject(e);
      }
    } catch (error) {
      reject(error);
    }
  });
}

// let lastDom;
export const initEvent = ctx => {
  // console.log(ctx)
  const dom = ctx.dom;
  const mousedownCb = ctx.mousedownCb || (() => {});
  const mousemoveCb = ctx.mousemoveCb || (() => {});
  const mousemoveCall = () => {};

  const mouseup = () => {
    // console.log('mouseup');
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
  };
  const mousemove = e => {
    const x = e.clientX,
      y = e.clientY;
    mousemoveCall({x, y});
  };
  const mousedown = e => {
    // console.log(e)
    const x = e.clientX,
      y = e.clientY;
    if (e.which == 1) {
      // console.log('mousedown', {x, y});
      mousedownCb({x, y});
      document.addEventListener('mousemove', mousemove);
      document.addEventListener('mouseup', mouseup);
    }
  }
  
  dom.addEventListener('mousedown', mousedown);
  document.addEventListener('mousemove', mousemoveCb);
  return () => {
    dom.removeEventListener('mousedown', mousedown);
    document.removeEventListener('mousemove', mousemoveCb);
  }
}

export const screen2Cartographic = (x, y, map) => {
  const cartographic = AirlookMap.MathUtils.screenToCartographic(
    new AirlookMap.Cartesian2(x, y),
    map || window.map
  );
  const longitude = AirlookMap.Math.toDegrees(cartographic.longitude); // 经度
  const latitude = AirlookMap.Math.toDegrees(cartographic.latitude); // 纬度
  const height = cartographic.height; // 高度
  return {
    longitude,
    latitude,
    height
  };
}

export const runPitchAnimation = map => {
  try {
    const canvas = map.scene.canvas;
    const { longitude, latitude, height } = screen2Cartographic(
      canvas.width / 2,
      canvas.height / 2,
      map
    );
    
    // 无相机动画版本
    // const transHeight =
    //   map.camera.positionCartographic.height /
    //   Math.sin(Math.abs(map.camera.pitch));
    // map.camera.positionCartographic = AirlookMap.Cartographic.fromDegrees(
    //   longitude,
    //   latitude,
    //   transHeight
    // );
    // map.camera.pitch = AirlookMap.Math.toRadians(90);

    // 支持相机动画
    const destination = AirlookMap.Cartographic.fromDegrees(
      longitude,
      latitude,
      height
    );
    const duration = 1000; // ms
    const distance = (map.camera.positionCartographic.height - height) / Math.sin(Math.abs(map.camera.pitch));
    // 动画
    (function update(map, destination, duration, distance) {
      map.postRender.addEventListener(updateCamera);
      const dPitchRad = AirlookMap.Math.toRadians(90) - map.camera.pitch;
      const pitchRadStep = (1000 / 60 * dPitchRad) / duration; // 假设 60帧/s

      function updateCamera() {
        // debugger;
        if(AirlookMap.Math.toDegrees(map.camera.pitch) >= 90) {
          map.camera.pitch = AirlookMap.Math.toRadians(90);
          map.postRender.removeEventListener(updateCamera);
          return;
        }
        const pitch = map.camera.pitch + pitchRadStep;
        // console.log(pitch);
        const cart = map.camera.cameraPositionFromTarget({
          destination: destination,
          orientation: {
            heading: map.camera.heading,
            pitch: pitch,
          },
          distance: distance,
        });
        map.camera.positionCartographic = cart;
        map.camera.pitch = pitch;
      }
    })(map, destination, duration, distance);
    
  } catch (error) {
    console.error(error);
  }
}

export const getTime = () =>
`${new Date().toLocaleDateString()} ${
  new Date().toTimeString().split(" ")[0]
}`;