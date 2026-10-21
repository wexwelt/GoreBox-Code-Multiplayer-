const il2cpp = {
  init() {
    this.base = Module.findBaseAddress("libil2cpp.so");
  },
  addr(offset) {
    return this.base.add(offset);
  },
};

const logger = {
  log(message) {
    console.log(`[*] ${message}`);
  },
};

const game = {
  stringNew: null,
  startLogin: null,
  loginWithCustomId: null,
  getPlayFabSettings: null,
  getPhotonServerSettings: null,
  unusedFn_25cca20: null,
  getDeviceId: null,
  unknownFn_5267f28: null,

  makeString(text) {
    return this.stringNew(Memory.allocUtf8String(text));
  },
  newObject(assemblyName, namespaceName, className) {
    const domainGet = new NativeFunction(
      Module.findExportByName("libil2cpp.so", "il2cpp_domain_get"),
      "pointer",
      [],
    );
    const assemblyOpen = new NativeFunction(
      Module.findExportByName("libil2cpp.so", "il2cpp_domain_assembly_open"),
      "pointer",
      ["pointer", "pointer"],
    );
    const getImage = new NativeFunction(
      Module.findExportByName("libil2cpp.so", "il2cpp_assembly_get_image"),
      "pointer",
      ["pointer"],
    );
    const classFromName = new NativeFunction(
      Module.findExportByName("libil2cpp.so", "il2cpp_class_from_name"),
      "pointer",
      ["pointer", "pointer", "pointer"],
    );
    const objectNew = new NativeFunction(
      Module.findExportByName("libil2cpp.so", "il2cpp_object_new"),
      "pointer",
      ["pointer"],
    );

    const domain = domainGet();
    const assemblyNameStr = Memory.allocUtf8String(assemblyName);
    const assembly = assemblyOpen(domain, assemblyNameStr);
    const image = getImage(assembly);
    const namespaceStr = Memory.allocUtf8String(namespaceName);
    const classNameStr = Memory.allocUtf8String(className);
    const klass = classFromName(image, namespaceStr, classNameStr);
    const obj = objectNew(klass);
    return obj;
  },

  readString(strPtr) {
    const charsPtr = strPtr.add(20);
    const length = strPtr.add(16).readInt();
    return Memory.readUtf16String(charsPtr, length);
  },

  initFunctions() {
    if (!il2cpp.base) {
      throw new Error("il2cpp is not initialized!");
    }

    this.stringNew = new NativeFunction(
      Module.findExportByName("libil2cpp.so", "il2cpp_string_new"),
      "pointer",
      ["pointer"],
    );
    this.startLogin = new NativeFunction(il2cpp.addr(0x30a8924), "void", [
      "pointer",
      "pointer",
    ]);
    this.loginWithCustomId = new NativeFunction(
      il2cpp.addr(0x4a01328),
      "void",
      ["pointer", "pointer", "pointer", "pointer", "pointer"],
    );
    this.getPlayFabSettings = new NativeFunction(
      il2cpp.addr(0x4a13234),
      "pointer",
      [],
    );
    this.getPhotonServerSettings = new NativeFunction(
      il2cpp.addr(0x25cbea0),
      "pointer",
      [],
    );
    this.unusedFn_25cca20 = new NativeFunction(
      il2cpp.addr(0x25cca20),
      "pointer",
      [],
    );
    this.getDeviceId = new NativeFunction(
      il2cpp.addr(0x525e634),
      "pointer",
      [],
    );
    this.unknownFn_5267f28 = new NativeFunction(
      il2cpp.addr(0x5267f28),
      "void",
      ["pointer"],
    );
  },
};

const antiCheatPatch = {
  install() {
    Interceptor.attach(il2cpp.addr(0x1fbd204), {
      onLeave(retval) {
        retval.add(0x18).writeInt(1);
      },
    });

    Interceptor.replace(
      il2cpp.addr(0x32bbe28),
      new NativeCallback(
        function (instance) {
          const inner = instance.add(0x20).readPointer();
          game.unknownFn_5267f28(inner.add(0x20).readPointer());
        },
        "void",
        ["pointer"],
      ),
    );
  },
};

const random = {
  randomString(len) {
    const alphabet = "abcdefghjkliyutqzxc1234568790";
    let result = "";
    for (let i = 0; i < len; ++i) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
  },
};

const serverSettingsPatch = {
  installPatch() {
    Interceptor.replace(
      il2cpp.addr(0x3093eac),
      new NativeCallback(
        function (self) {
          const appSettings = game
            .getPhotonServerSettings()
            .add(0x18)
            .readPointer();
          appSettings
            .add(0x10)
            .writePointer(
              game.makeString("PHOTON_HERE"), //pun app
            );
          game
            .getPlayFabSettings()
            .add(0x18)
            .writePointer(game.makeString("PLAYFAB_HERE")); //playfab id
          game.startLogin(self, game.makeString(random.randomString(16)));
        },
        "void",
        ["pointer"],
      ),
    );
  },
};

const loginPatch = {
  installLogin() {
    Interceptor.replace(
      il2cpp.addr(0x4a01be0),
      new NativeCallback(
        function (request, onLogin, onFail, customData, extraHeaders) {
          const loginRequest = game.newObject(
            "PlayFab",
            "PlayFab.ClientModels",
            "LoginWithCustomIDRequest",
          );
          loginRequest.add(0x18).writePointer(ptr(257));
          loginRequest.add(0x20).writePointer(game.getDeviceId());
          game.loginWithCustomId(
            loginRequest,
            onLogin,
            onFail,
            customData,
            extraHeaders,
          );
        },
        "void",
        ["pointer", "pointer", "pointer", "pointer", "pointer"],
      ),
    );
  },
};

const urlPatch = {
  installUrlRedirect() {
    Interceptor.attach(il2cpp.addr(0x5494040), {
      onEnter(args) {
        const url = game.readString(args[1]);
        if (url == "https://pastebin.com/raw/gnG4kQLW") {
          args[1] = game.makeString("https://pastebin.com/raw/id_pastebin"); //news url
        } else if (url == "https://pastebin.com/raw/Z3tEgNLZ") {
          args[1] = game.makeString("https://pastebin.com/raw/id_pastebin"); //version url
        }
      },
    });
  },
  installPackageName() {
    Interceptor.attach(il2cpp.addr(0x5221b20), {
      onLeave(retval) {
        retval.replace(game.makeString("com.F2Games.GBDE"));
      },
    });
  },
};

function main() {
  il2cpp.init();
  game.initFunctions();
  antiCheatPatch.install();
  serverSettingsPatch.installPatch();
  loginPatch.installLogin();
  urlPatch.installUrlRedirect();
  urlPatch.installPackageName();
}

setTimeout(main, 500);
