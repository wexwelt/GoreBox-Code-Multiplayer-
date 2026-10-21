const main = (libName) => {
  const base = Module.findBaseAddress(libName);

  const PhotonAppID = "PHOTON_HERE"; //pun app
  const PhotonVoiceAppID = "PHOTON_HERE"; //voice app
  const PlayFabTitleID = "PLAYFAB_HERE"; //playfab id

  const il2cpp_class_get_method_from_name = new NativeFunction(
    Module.findExportByName(libName, "il2cpp_class_get_method_from_name"),
    "pointer",
    ["pointer", "pointer", "int"]
  );

  const read_il2cpp_string = (strptr) => {
    if (strptr.isNull()) return "";
    const length = strptr.add(0x10).readInt();
    return Memory.readUtf16String(strptr.add(0x14), length);
  };

  const il2cpp_domain_get = new NativeFunction(
    Module.findExportByName(libName, "il2cpp_domain_get"),
    "pointer",
    []
  );
  const il2cpp_class_get_field_from_name = new NativeFunction(
    Module.findExportByName(libName, "il2cpp_class_get_field_from_name"),
    "pointer",
    ["pointer", "pointer"]
  );
  const il2cpp_field_get_offset = new NativeFunction(
    Module.findExportByName(libName, "il2cpp_field_get_offset"),
    "int",
    ["pointer"]
  );

  const GetFieldFromName = (instance, fieldName) => {
    if (instance.isNull()) {
      return ptr(0);
    }
    const fieldInfo = il2cpp_class_get_field_from_name(
      instance.readPointer(),
      Memory.allocUtf8String(fieldName)
    );
    return fieldInfo;
  };

  const GetField = (instance, fieldName) => {
    if (instance.isNull()) return ptr(0);
    const klass = instance.readPointer();
    const fieldInfo = il2cpp_class_get_field_from_name(
      klass,
      Memory.allocUtf8String(fieldName)
    );
    if (fieldInfo.isNull()) return ptr(0);
    const offset = il2cpp_field_get_offset(fieldInfo);
    return instance.add(offset);
  };
  const il2cpp_object_new = new NativeFunction(
    Module.findExportByName(libName, "il2cpp_object_new"),
    "pointer",
    ["pointer"]
  );

  const il2cpp_string_new = (str) => {
    return new NativeFunction(
      Module.findExportByName(libName, "il2cpp_string_new"),
      "pointer",
      ["pointer"]
    )(Memory.allocUtf8String(str));
  };
  const GenerateRandomString = (len) => {
    const Alphabet = "abcdefghjkliyutqzxc1234568790";
    let Result = "";
    for (let i = 0; i < len; ++i) {
      Result += Alphabet[Math.floor(Math.random() * Alphabet.length)];
    }
    return Result;
  };

  const il2cpp_domain_assembly_open = new NativeFunction(
    Module.findExportByName(libName, "il2cpp_domain_assembly_open"),
    "pointer",
    ["pointer", "pointer"]
  );

  const il2cpp_assembly_get_image = new NativeFunction(
    Module.findExportByName(libName, "il2cpp_assembly_get_image"),
    "pointer",
    ["pointer"]
  );

  const il2cpp_class_from_name = new NativeFunction(
    Module.findExportByName(libName, "il2cpp_class_from_name"),
    "pointer",
    ["pointer", "pointer", "pointer"]
  );

  const GetClassFromName = (assemblyName, namespaceName, className) => {
    const domain = il2cpp_domain_get();
    const assembly = il2cpp_domain_assembly_open(
      domain,
      Memory.allocUtf8String(assemblyName)
    );
    const image = il2cpp_assembly_get_image(assembly);
    return il2cpp_class_from_name(
      image,
      Memory.allocUtf8String(namespaceName),
      Memory.allocUtf8String(className)
    );
  };
  const new_object = (assemblyName, namespaceName, className) => {
    const klass = GetClassFromName(assemblyName, namespaceName, className);
    const obj = il2cpp_object_new(klass);
    return obj;
  };
  const GetMethodFromName = (
    assemblyName,
    namespaceName,
    className,
    methodName,
    paramCount
  ) => {
    return il2cpp_class_get_method_from_name(
      GetClassFromName(assemblyName, namespaceName, className),
      Memory.allocUtf8String(methodName),
      paramCount
    ).readPointer();
  };

  const GetPhotonServerSettings = () => {
    return new NativeFunction(
      GetMethodFromName(
        "Assembly-CSharp",
        "Photon.Pun",
        "PhotonNetwork",
        "get_PhotonServerSettings",
        0
      ),
      "pointer",
      []
    )();
  };
  const GetPlayFabSettings = () => {
    return new NativeFunction(
      GetMethodFromName(
        "PlayFab",
        "PlayFab",
        "PlayFabSettings",
        "get_PlayFabSharedPrivate",
        0
      ),
      "pointer",
      []
    )();
  };
  const StartLogin = (VersionValidator, AuthCode) => {
    return new NativeFunction(
      GetMethodFromName(
        "Assembly-CSharp",
        "",
        "VersionValidator",
        "MBALGCBDJML",
        1
      ),
      "void",
      ["pointer", "pointer"]
    )(VersionValidator, il2cpp_string_new(AuthCode));
  };
  const GetDeviceID = () => {
    return new NativeFunction(
      GetMethodFromName(
        "UnityEngine",
        "UnityEngine",
        "SystemInfo",
        "get_deviceUniqueIdentifier",
        0
      ),
      "pointer",
      []
    )();
  };
  const InvokeEvent = (event) => {
    return new NativeFunction(
      GetMethodFromName(
        "UnityEngine",
        "UnityEngine.Events",
        "UnityEvent",
        "Invoke",
        0
      ),
      "void",
      ["pointer"]
    )(event);
  };
  const LoginWithCustomID = (
    request,
    onLogin,
    onFail,
    customData,
    extraHeaders
  ) => {
    return new NativeFunction(
      GetMethodFromName(
        "PlayFab",
        "PlayFab",
        "PlayFabClientAPI",
        "LoginWithCustomID",
        5
      ),
      "void",
      ["pointer", "pointer", "pointer", "pointer", "pointer"]
    )(request, onLogin, onFail, customData, extraHeaders);
  };

  Interceptor.attach(base.add(0x3572FAC), {
    onEnter(a) {
      console.log("oj")
    }
  })

  Interceptor.replace(
    GetMethodFromName("Assembly-CSharp", "", "VersionValidator", "Start", 0),
    new NativeCallback(
      (instance) => {
        console.log("a");
        const ServerSettings = GetPhotonServerSettings();
        const AppSettings = GetField(
          ServerSettings,
          "AppSettings"
        ).readPointer();

        GetField(AppSettings, "AppIdRealtime").writePointer(
          il2cpp_string_new(PhotonAppID)
        );
        GetField(AppSettings, "AppIdVoice").writePointer(
          il2cpp_string_new(PhotonVoiceAppID)
        );

        const PlayFabSettings = GetPlayFabSettings();
        GetField(PlayFabSettings, "TitleId").writePointer(
          il2cpp_string_new(PlayFabTitleID)
        );

        StartLogin(instance, GenerateRandomString(16));
      },
      "void",
      ["pointer"]
    )
  );

  Interceptor.attach(
    GetMethodFromName(
      "UnityEngine",
      "UnityEngine.Networking",
      "UnityWebRequest",
      ".ctor",
      4
    ),
    {
      onEnter(a) {
        const string = read_il2cpp_string(a[1]);

        if (string == "https://pastebin.com/raw/Z3tEgNLZ") {
          a[1] = il2cpp_string_new("https://pastebin.com/raw/id_pastebin");
        } //version
        else if (string == "https://pastebin.com/raw/gnG4kQLW") {
          a[1] = il2cpp_string_new("https://pastebin.com/raw/id_pastebin");
        } //news
      },
    }
  );

  Interceptor.replace(
    GetMethodFromName(
      "PlayFab",
      "PlayFab",
      "PlayFabClientAPI",
      "LoginWithGooglePlayGamesServices",
      5
    ),
    new NativeCallback(
      (instance, a1, a2, a3, a4) => {
        let LoginWithCustomIDRequest = new_object(
          "PlayFab",
          "PlayFab.ClientModels",
          "LoginWithCustomIDRequest"
        );

        GetField(LoginWithCustomIDRequest, "CreateAccount").writePointer(
          ptr(257)
        );
        GetField(LoginWithCustomIDRequest, "CustomId").writePointer(
          GetDeviceID()
        );
        LoginWithCustomID(LoginWithCustomIDRequest, a1, a2, a3, a4);
      },
      "void",
      ["pointer", "pointer", "pointer", "pointer", "pointer"]
    )
  );
  Interceptor.replace(
    GetMethodFromName("Assembly-CSharp", "", "EasyUnityAds", "LoadRewarded", 0),
    new NativeCallback(
      (instance) => {
        const addcaller = GetField(instance, "adCaller").readPointer();
        InvokeEvent(GetField(addcaller, "NPMBFDHFNOE").readPointer()); //event
      },
      "void",
      ["pointer"]
    )
  );
  Interceptor.attach(
    GetMethodFromName("ACTk.Runtime", "", "IAEMLINJAAN", "PDDJNDKHCJL", 0),
    {
      onLeave(ret) {
        GetField(ret, "<PNNHFGAIGAJ>k__BackingField").writeInt(1);
      },
    }
  );
};

const init = () => {
  console.log("init")
  main("libil2cpp.so");
};

setTimeout(() => {
  init();
}, 1000);
