const main = () => {
  const base = Module.findBaseAddress("libil2cpp.so");

  const PhotonAppID = "PHOTON_HERE"; //pun app
  const PhotonVoiceAppID = "PHOTON_HERE"; //voice app
  const PlayFabTitleID = "PLAYFAB_HERE"; //playfab id

  const il2cpp_domain_assembly_open = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_domain_assembly_open"),
    "pointer",
    ["pointer", "pointer"]
  );
  const read_il2cpp_string = (strptr) => {
    if (strptr.isNull()) return "";
    const length = strptr.add(0x10).readInt();
    return Memory.readUtf16String(strptr.add(0x14), length);
  };

  const il2cpp_domain_get = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_domain_get"),
    "pointer",
    []
  );
  const il2cpp_object_new = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_object_new"),
    "pointer",
    ["pointer"]
  );
  const il2cpp_class_get_field_from_name = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_class_get_field_from_name"),
    "pointer",
    ["pointer", "pointer"]
  );
  const il2cpp_field_get_offset = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_field_get_offset"),
    "int",
    ["pointer"]
  );

  const il2cpp_assembly_get_image = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_assembly_get_image"),
    "pointer",
    ["pointer"]
  );

  const il2cpp_class_from_name = new NativeFunction(
    Module.findExportByName("libil2cpp.so", "il2cpp_class_from_name"),
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

  const il2cpp_string_new = (str) => {
    return new NativeFunction(
      Module.findExportByName("libil2cpp.so", "il2cpp_string_new"),
      "pointer",
      ["pointer"]
    )(Memory.allocUtf8String(str));
  };

  const LoginWithCustomID = (
    request,
    onLogin,
    onFail,
    customData,
    extraHeaders
  ) => {
    return new NativeFunction(base.add(0x440d51c), "void", [
      "pointer",
      "pointer",
      "pointer",
      "pointer",
      "pointer",
    ])(request, onLogin, onFail, customData, extraHeaders);
  };
  const GenerateRandomString = (len) => {
    const Alphabet = "abcdefghjkliyutqzxc1234568790";
    let Result = "";
    for (let i = 0; i < len; ++i) {
      Result += Alphabet[Math.floor(Math.random() * Alphabet.length)];
    }
    return Result;
  };

  const GetPhotonServerSettings = () => {
    return new NativeFunction(base.add(0x24e80e8), "pointer", [])();
  };
  const GetPlayFabSettings = () => {
    return new NativeFunction(base.add(0x43be138), "pointer", [])();
  };
  const StartLogin = (VersionValidator, AuthCode) => {
    return new NativeFunction(base.add(0x2694284), "void", [
      "pointer",
      "pointer",
    ])(VersionValidator, il2cpp_string_new(AuthCode));
  };
  const GetDeviceID = () => {
    return new NativeFunction(base.add(0x43be338), "pointer", [])();
  };

  Interceptor.replace(
    base.add(0x268ab54),
    new NativeCallback(
      (instance) => {
        const ServerSettings = GetPhotonServerSettings();
        const AppSettings = ServerSettings.add(0x18).readPointer();

        AppSettings.add(0x10).writePointer(il2cpp_string_new(PhotonAppID));
        AppSettings.add(0x28).writePointer(il2cpp_string_new(PhotonVoiceAppID));

        const PlayFabSettings = GetPlayFabSettings();
        PlayFabSettings.add(0x18).writePointer(
          il2cpp_string_new(PlayFabTitleID)
        );
        StartLogin(instance, GenerateRandomString(16));
      },
      "void",
      ["pointer"]
    )
  );

  Interceptor.attach(base.add(0x4e335e0), {
    onEnter(a) {
      const string = read_il2cpp_string(a[1]);
      if (string == "https://pastebin.com/raw/Z3tEgNLZ") {
        a[1] = il2cpp_string_new("https://pastebin.com/raw/id_pastebin");
      } //version url
    },
  });

  Interceptor.attach(base.add(0x1ce08d4), {
    onLeave(r) {
      r.add(0x18).writeInt(1);
    },
  });

  Interceptor.replace(
    base.add(0x440ddd4),
    new NativeCallback(
      (request, a1, a2, a3, a4) => {
        let LoginWithCustomIDRequest = new_object(
          "PlayFab",
          "PlayFab.ClientModels",
          "LoginWithCustomIDRequest"
        );
        LoginWithCustomIDRequest.add(0x18).writePointer(ptr(257));
        LoginWithCustomIDRequest.add(0x20).writePointer(GetDeviceID());

        LoginWithCustomID(LoginWithCustomIDRequest, a1, a2, a3, a4);
      },
      "void",
      ["pointer", "pointer", "pointer", "pointer", "pointer"]
    )
  );
};

setTimeout(main, 1);
