#!/usr/bin/env bash
# shellcheck disable=SC1091,2154

set -e

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  cp -rp src/insider/* vscode/
else
  cp -rp src/stable/* vscode/
fi

cp -f LICENSE vscode/LICENSE.txt

cd vscode || { echo "'vscode' dir not found"; exit 1; }

# rm -rf extensions/copilot

{ set +x; } 2>/dev/null

# {{{ product.json
cp product.json{,.bak}

setpath() {
  local jsonTmp
  { set +x; } 2>/dev/null
  jsonTmp=$( jq --arg 'value' "${3}" "setpath(path(.${2}); \$value)" "${1}.json" )
  echo "${jsonTmp}" > "${1}.json"
  set -x
}

setpath_json() {
  local jsonTmp
  { set +x; } 2>/dev/null
  jsonTmp=$( jq --argjson 'value' "${3}" "setpath(path(.${2}); \$value)" "${1}.json" )
  echo "${jsonTmp}" > "${1}.json"
  set -x
}

setpath "product" "checksumFailMoreInfoUrl" "https://go.microsoft.com/fwlink/?LinkId=828886"
setpath "product" "documentationUrl" "https://go.microsoft.com/fwlink/?LinkID=533484#vscode"
setpath_json "product" "extensionsGallery" '{"serviceUrl": "https://open-vsx.org/vscode/gallery", "itemUrl": "https://open-vsx.org/vscode/item", "latestUrlTemplate": "https://open-vsx.org/vscode/gallery/{publisher}/{name}/latest", "controlUrl": "https://raw.githubusercontent.com/EclipseFdn/publish-extensions/refs/heads/master/extension-control/extensions.json"}'

setpath "product" "introductoryVideosUrl" "https://go.microsoft.com/fwlink/?linkid=832146"
setpath "product" "keyboardShortcutsUrlLinux" "https://go.microsoft.com/fwlink/?linkid=832144"
setpath "product" "keyboardShortcutsUrlMac" "https://go.microsoft.com/fwlink/?linkid=832143"
setpath "product" "keyboardShortcutsUrlWin" "https://go.microsoft.com/fwlink/?linkid=832145"
setpath "product" "licenseUrl" "https://github.com/bouclem/Voidium-Code/blob/master/LICENSE"
setpath_json "product" "linkProtectionTrustedDomains" '["https://open-vsx.org"]'
setpath "product" "releaseNotesUrl" "https://go.microsoft.com/fwlink/?LinkID=533483#vscode"
setpath "product" "reportIssueUrl" "https://github.com/bouclem/Voidium-Code/issues/new"
setpath "product" "requestFeatureUrl" "https://go.microsoft.com/fwlink/?LinkID=533482"
setpath "product" "tipsAndTricksUrl" "https://go.microsoft.com/fwlink/?linkid=852118"
setpath "product" "twitterUrl" "https://go.microsoft.com/fwlink/?LinkID=533687"

if [[ "${DISABLE_UPDATE}" != "yes" ]]; then
  setpath "product" "updateUrl" "https://raw.githubusercontent.com/bouclem/versions/refs/heads/master"

  if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
    setpath "product" "downloadUrl" "https://github.com/bouclem/Voidium-Code-insiders/releases"
  else
    setpath "product" "downloadUrl" "https://github.com/bouclem/Voidium-Code/releases"
  fi

  # if [[ "${OS_NAME}" == "windows" ]]; then
  #   setpath_json "product" "win32VersionedUpdate" "true"
  # fi
fi

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  setpath "product" "nameShort" "Voidium Code - Insiders"
  setpath "product" "nameLong" "Voidium Code - Insiders"
  setpath "product" "applicationName" "voidium-insiders"
  setpath "product" "dataFolderName" ".voidium-insiders"
  setpath "product" "linuxIconName" "voidium-insiders"
  setpath "product" "quality" "insider"
  setpath "product" "urlProtocol" "voidium-insiders"
  setpath "product" "serverApplicationName" "voidium-server-insiders"
  setpath "product" "serverDataFolderName" ".voidium-server-insiders"
  setpath "product" "darwinBundleIdentifier" "com.voidware.VoidiumCodeInsiders"
  setpath "product" "win32AppUserModelId" "Voidware.VoidiumCodeInsiders"
  setpath "product" "win32DirName" "Voidium Code Insiders"
  setpath "product" "win32MutexName" "voidiuminsiders"
  setpath "product" "win32NameVersion" "Voidium Code Insiders"
  setpath "product" "win32RegValueName" "VoidiumCodeInsiders"
  setpath "product" "win32ShellNameShort" "Voidium Code Insiders"
  setpath "product" "win32AppId" "{{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}"
  setpath "product" "win32x64AppId" "{{B2C3D4E5-F6A7-8901-BCDE-F23456789012}"
  setpath "product" "win32arm64AppId" "{{C3D4E5F6-A7B8-9012-CDEF-345678901234}"
  setpath "product" "win32UserAppId" "{{D4E5F6A7-B8C9-0123-DEFA-456789012345}"
  setpath "product" "win32x64UserAppId" "{{E5F6A7B8-C9D0-1234-EFAB-567890123456}"
  setpath "product" "win32arm64UserAppId" "{{F6A7B8C9-D0E1-2345-FABC-678901234567}"
  setpath "product" "tunnelApplicationName" "voidium-insiders-tunnel"
  setpath "product" "win32TunnelServiceMutex" "voidiuminsiders-tunnelservice"
  setpath "product" "win32TunnelMutex" "voidiuminsiders-tunnel"
  setpath "product" "win32ContextMenu.x64.clsid" "A1B2C3D4-E5F6-7890-ABCD-EF1234567891"
  setpath "product" "win32ContextMenu.arm64.clsid" "B2C3D4E5-F6A7-8901-BCDE-F23456789013"
else
  setpath "product" "nameShort" "Voidium Code"
  setpath "product" "nameLong" "Voidium Code"
  setpath "product" "applicationName" "voidium"
  setpath "product" "linuxIconName" "voidium"
  setpath "product" "quality" "stable"
  setpath "product" "urlProtocol" "voidium"
  setpath "product" "serverApplicationName" "voidium-server"
  setpath "product" "serverDataFolderName" ".voidium-server"
  setpath "product" "darwinBundleIdentifier" "com.voidware.VoidiumCode"
  setpath "product" "win32AppUserModelId" "Voidware.VoidiumCode"
  setpath "product" "win32DirName" "Voidium Code"
  setpath "product" "win32MutexName" "voidium"
  setpath "product" "win32NameVersion" "Voidium Code"
  setpath "product" "win32RegValueName" "VoidiumCode"
  setpath "product" "win32ShellNameShort" "Voidium Code"
  setpath "product" "win32AppId" "{{A1B2C3D4-E5F6-7890-ABCD-EF1234567892}"
  setpath "product" "win32x64AppId" "{{B2C3D4E5-F6A7-8901-BCDE-F23456789014}"
  setpath "product" "win32arm64AppId" "{{C3D4E5F6-A7B8-9012-CDEF-345678901235}}"
  setpath "product" "win32UserAppId" "{{D4E5F6A7-B8C9-0123-DEFA-456789012346}"
  setpath "product" "win32x64UserAppId" "{{E5F6A7B8-C9D0-1234-EFAB-567890123457}"
  setpath "product" "win32arm64UserAppId" "{{F6A7B8C9-D0E1-2345-FABC-678901234568}}"
  setpath "product" "tunnelApplicationName" "voidium-tunnel"
  setpath "product" "win32TunnelServiceMutex" "voidium-tunnelservice"
  setpath "product" "win32TunnelMutex" "voidium-tunnel"
  setpath "product" "win32ContextMenu.x64.clsid" "A1B2C3D4-E5F6-7890-ABCD-EF1234567893"
  setpath "product" "win32ContextMenu.arm64.clsid" "B2C3D4E5-F6A7-8901-BCDE-F23456789015"
fi

setpath_json "product" "tunnelApplicationConfig" '{}'

jsonTmp=$( jq -s '.[0] * .[1]' product.json ../product.json )
echo "${jsonTmp}" > product.json && unset jsonTmp

cat product.json
# }}}

# include common functions
. ../utils.sh

# {{{ apply patches

echo "APP_NAME=\"${APP_NAME}\""
echo "APP_NAME_LC=\"${APP_NAME_LC}\""
echo "ASSETS_REPOSITORY=\"${ASSETS_REPOSITORY}\""
echo "BINARY_NAME=\"${BINARY_NAME}\""
echo "GH_REPO_PATH=\"${GH_REPO_PATH}\""
echo "GLOBAL_DIRNAME=\"${GLOBAL_DIRNAME}\""
echo "ORG_NAME=\"${ORG_NAME}\""
echo "TUNNEL_APP_NAME=\"${TUNNEL_APP_NAME}\""

if [[ "${DISABLE_UPDATE}" == "yes" ]]; then
  mv ../patches/00-update-disable.patch.yet ../patches/00-update-disable.patch
fi

for file in ../patches/*.json; do
  if [[ -f "${file}" ]]; then
    apply_actions "${file}"
  fi
done

for file in ../patches/*.patch; do
  if [[ -f "${file}" ]]; then
    apply_patch "${file}"
  fi
done

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  for file in ../patches/insider/*.patch; do
    if [[ -f "${file}" ]]; then
      apply_patch "${file}"
    fi
  done
fi

if [[ -d "../patches/${OS_NAME}/" ]]; then
  for file in "../patches/${OS_NAME}/"*.patch; do
    if [[ -f "${file}" ]]; then
      apply_patch "${file}"
    fi
  done
fi

for file in ../patches/user/*.patch; do
  if [[ -f "${file}" ]]; then
    apply_patch "${file}"
  fi
done
# }}}

set -x

# {{{ install dependencies
export ELECTRON_SKIP_BINARY_DOWNLOAD=1
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

if [[ "${OS_NAME}" == "linux" ]]; then
  export VSCODE_SKIP_NODE_VERSION_CHECK=1

   if [[ "${npm_config_arch}" == "arm" ]]; then
    export npm_config_arm_version=7
  fi
elif [[ "${OS_NAME}" == "windows" ]]; then
  if [[ "${npm_config_arch}" == "arm" ]]; then
    export npm_config_arm_version=7
  fi
else
  if [[ "${CI_BUILD}" != "no" ]]; then
    clang++ --version
  fi
fi

node build/npm/preinstall.ts

mv .npmrc .npmrc.bak
cp ../npmrc .npmrc

for i in {1..5}; do # try 5 times
  if [[ "${CI_BUILD}" != "no" && "${OS_NAME}" == "osx" ]]; then
    CXX=clang++ npm ci && break
  else
    npm ci && break
  fi

  if [[ $i == 5 ]]; then
    echo "Npm install failed too many times" >&2
    exit 1
  fi
  echo "Npm install failed $i, trying again..."

  sleep $(( 15 * (i + 1)))
done

mv .npmrc.bak .npmrc
# }}}

# package.json
cp package.json{,.bak}

setpath "package" "version" "${RELEASE_VERSION%-insider}"

replace 's|Microsoft Corporation|Voidware|' package.json

cp resources/server/manifest.json{,.bak}

if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
  setpath "resources/server/manifest" "name" "Voidium Code - Insiders"
  setpath "resources/server/manifest" "short_name" "Voidium Code - Insiders"
else
  setpath "resources/server/manifest" "name" "Voidium Code"
  setpath "resources/server/manifest" "short_name" "Voidium Code"
fi

# announcements
replace "s|\\[\\/\\* BUILTIN_ANNOUNCEMENTS \\*\\/\\]|$( tr -d '\n' < ../announcements-builtin.json )|" src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.ts

../undo_telemetry.sh

replace 's|Microsoft Corporation|Voidware|' build/lib/electron.ts
replace 's|([0-9]) Microsoft|\1 Voidware|' build/lib/electron.ts

if [[ "${OS_NAME}" == "linux" ]]; then
  # microsoft adds their apt repo to sources
  # unless the app name is code-oss
  # as we are renaming the application to vscodium
  # we need to edit a line in the post install template
  if [[ "${VSCODE_QUALITY}" == "insider" ]]; then
    sed -i "s/code-oss/voidium-insiders/" resources/linux/debian/postinst.template
  else
    sed -i "s/code-oss/voidium/" resources/linux/debian/postinst.template
  fi

  # fix the packages metadata
  # code.appdata.xml
  sed -i 's|Visual Studio Code|Voidium Code|g' resources/linux/code.appdata.xml
  sed -i 's|https://code.visualstudio.com/docs/setup/linux|https://github.com/bouclem/Voidium-Code#download-install|' resources/linux/code.appdata.xml
  sed -i 's|https://code.visualstudio.com/home/home-screenshot-linux-lg.png|https://voidium-code.com/img/voidium-code.png|' resources/linux/code.appdata.xml
  sed -i 's|https://code.visualstudio.com|https://voidium-code.com|' resources/linux/code.appdata.xml

  # control.template
  sed -i 's|Microsoft Corporation <vscode-linux@microsoft.com>|Voidware Team https://github.com/bouclem/Voidium-Code/graphs/contributors|'  resources/linux/debian/control.template
  sed -i 's|Visual Studio Code|Voidium Code|g' resources/linux/debian/control.template
  sed -i 's|https://code.visualstudio.com/docs/setup/linux|https://github.com/bouclem/Voidium-Code#download-install|' resources/linux/debian/control.template
  sed -i 's|https://code.visualstudio.com|https://voidium-code.com|' resources/linux/debian/control.template

  # code.spec.template
  sed -i 's|Microsoft Corporation|Voidware Team|' resources/linux/rpm/code.spec.template
  sed -i 's|Visual Studio Code Team <vscode-linux@microsoft.com>|Voidware Team https://github.com/bouclem/Voidium-Code/graphs/contributors|' resources/linux/rpm/code.spec.template
  sed -i 's|Visual Studio Code|Voidium Code|' resources/linux/rpm/code.spec.template
  sed -i 's|https://code.visualstudio.com/docs/setup/linux|https://github.com/bouclem/Voidium-Code#download-install|' resources/linux/rpm/code.spec.template
  sed -i 's|https://code.visualstudio.com|https://voidium-code.com|' resources/linux/rpm/code.spec.template

  # snapcraft.yaml
  sed -i 's|Visual Studio Code|Voidium Code|' resources/linux/rpm/code.spec.template
elif [[ "${OS_NAME}" == "windows" ]]; then
  # code.iss
  sed -i 's|https://code.visualstudio.com|https://voidium-code.com|' build/win32/code.iss
  sed -i 's|Microsoft Corporation|Voidware|' build/win32/code.iss
fi

cd ..
