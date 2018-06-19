import CryptoJS from 'crypto-js';
import JSEncrypt from 'node-rsa';

class Encrypt {
  /*
  * 生成密钥
  * @params len 生成密钥的长度
  *
  * */
  getKey(len) {
    // 默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    const maxPos = chars.length;
    let key = '';
    len = len || 32;

    for(let i = 0; i < len; i++) {
      key += chars.charAt(Math.floor(Math.random() * maxPos));
    }

    return key;
  }

  /*
   * AES数据/密钥加密
   * @params data 需要加密的数据
   * @params key 私钥
   *
   * */
  encryptAES(data, key) {
    const newKey = CryptoJS.enc.Utf8.parse(key);
    const iv1 = CryptoJS.enc.Utf8.parse(key);
    const srcs = CryptoJS.enc.Utf8.parse(data);

    const encrypted = CryptoJS.AES.encrypt(srcs, newKey, {
      iv: iv1,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  /*
   * AES数据解密
   * @params data 需要解密的数据
   * @params key 私钥
   *
   * */
  decryptAES(data, key) {
    const newKey = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.enc.Utf8.parse(key);

    const decrypt = CryptoJS.AES.decrypt(data, newKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decryptedStr.toString());
  }

  /*
   * RSA数据/公钥加密
   * @params data 需要加密的数据
   * @params pubKey 公钥
   * */
  encryptRSA(data, pubKey) {
    // var encrypt = new JSEncrypt();
    // encrypt.setPublicKey(pubKey);
    // return encrypt.encrypt(data);

    const clientKey = new JSEncrypt(pubKey, 'public');
    clientKey.setOptions({
      encryptionScheme: 'pkcs1'
    });
    const encrypt = clientKey.encrypt(data, 'base64');

    return encrypt;


  }

  /*
   * 获取加密数据
   * @params dataObject 请求参数对象
   *
   * */
  encryptData(bodyObject, headObject) {
    let initData = {
        requestBody: bodyObject,
        requestHead: {
          userId: headObject.userId,
          ticket: headObject.ticket,
          deviceType: '5'
        },
        encryptKey: '',
        encryptData: '',
        aesKey: ''
    };

    initData = JSON.stringify(initData);

    const temp = {};
    temp.key = this.getKey(16);
    temp.pubKey = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwwOuOfzGbOFkapZHjOsavZ0+2MUe08OBkMMPchLRuvLo3S1AIkHxOxDmYRGwxhIu1YZB3HVzK4rU+PsAmXh4B6dMCHy788y9u13jElMbqFbY8ik30CPwQJFAJ+qZftut1C+R2FXzc4jZo6pZMF/AKW+jJVNwUJrZxOGp+OW3nhfcnV+CNaulcoaCxameJp+6TT8mDrpKfgw4JCY3iecvOYBj3DTtK/STBqWjJSkMHkFwh6QRnmaC+TxVxGvccuf/nV0p+MZE5lSwmefOc9bCBPXnUdy277x/N4oR0s/f2tQv7t6sr8/16vmylwB1rKcKN0rLtI0uDbk48a+R89fk9QIDAQAB`;
    const encryptKey = this.encryptRSA(temp.key, temp.pubKey);
    const encryptData = this.encryptAES(initData, temp.key);

    const postData = {
      encryptKey: encryptKey,
      encryptData: encryptData
    };

    const data = {
      postData,
      privateKey: temp.key
    };

    return data;
  }
}

export default new Encrypt();
