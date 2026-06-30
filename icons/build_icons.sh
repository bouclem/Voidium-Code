#!/usr/bin/env bash
# shellcheck disable=SC1091

set -e

# DEBUG
# set -o xtrace

while getopts ":i" opt; do
  case "$opt" in
    i)
      QUALITY="insider"
      [[ -z "${COLOR}" ]] && COLOR="orange1"
      ;;
    *)
      ;;
  esac
done

[[ -z "${COLOR}" ]] && COLOR="blue1"
[[ -z "${QUALITY}" ]] && QUALITY="stable"
[[ -z "${SRC_PREFIX}" ]] && SRC_PREFIX=""
[[ -z "${VSCODE_PREFIX}" ]] && VSCODE_PREFIX=""

check_programs() { # {{{
  for arg in "$@"; do
    if ! command -v "${arg}" &> /dev/null; then
      echo "${arg} could not be found"
      exit 0
    fi
  done
} # }}}

check_programs "composite" "convert" "icotool" "rsvg-convert" "sed"

. "./${VSCODE_PREFIX}utils.sh"

if ! declare -F load_windows_ico &>/dev/null; then
  load_windows_ico() {
    wget "https://raw.githubusercontent.com/bouclem/Voidium-Code/main/icons/win32/nobg/${COLOR}/voidium.ico" -O "$1"
  }
fi

build_media() { # {{{
  if [[ ! -f "${SRC_PREFIX}src/${QUALITY}/src/vs/workbench/browser/media/code-icon.svg" ]]; then
    mkdir -p "${SRC_PREFIX}src/${QUALITY}/src/vs/workbench/browser/media"

    if [[ "${QUALITY}" == "insider" ]]; then
      cp "icons/${QUALITY}/voidium_insiders_light.svg" "${SRC_PREFIX}src/${QUALITY}/src/vs/workbench/browser/media/code-icon.svg"
      gsed -i 's|width="100" height="100"|width="1024" height="1024"|' "${SRC_PREFIX}src/${QUALITY}/src/vs/workbench/browser/media/code-icon.svg"
    else
      cp "icons/${QUALITY}/voidium_light.svg" "${SRC_PREFIX}src/${QUALITY}/src/vs/workbench/browser/media/code-icon.svg"
      gsed -i 's|width="100" height="100"|width="1024" height="1024"|' "${SRC_PREFIX}src/${QUALITY}/src/vs/workbench/browser/media/code-icon.svg"
    fi
  fi
} # }}}

build_server() { # {{{
  mkdir -p "${SRC_PREFIX}src/${QUALITY}/resources/server"

  if [[ ! -f "${SRC_PREFIX}src/${QUALITY}/resources/server/favicon.ico" ]]; then
    load_windows_ico "${SRC_PREFIX}src/${QUALITY}/resources/server/favicon.ico"
  fi

  if [[ ! -f "${SRC_PREFIX}src/${QUALITY}/resources/server/code-192.png" ]]; then
    rsvg-convert -w 192 -h 192 "icons/${QUALITY}/voidium_cnl.svg" -o "${SRC_PREFIX}src/${QUALITY}/resources/server/code-192.png"
  fi

  if [[ ! -f "${SRC_PREFIX}src/${QUALITY}/resources/server/code-512.png" ]]; then
    rsvg-convert -w 512 -h 512 "icons/${QUALITY}/voidium_cnl.svg" -o "${SRC_PREFIX}src/${QUALITY}/resources/server/code-512.png"
  fi
} # }}}

build_windows_main() { # {{{
  if [[ ! -f "${SRC_PREFIX}src/${QUALITY}/resources/win32/code.ico" ]]; then
    mkdir -p "${SRC_PREFIX}src/${QUALITY}/resources/win32"

    load_windows_ico "${SRC_PREFIX}src/${QUALITY}/resources/win32/code.ico"
  fi
} # }}}

build_windows_type() { # {{{
  local FILE_PATH IMG_SIZE IMG_BG_COLOR LOGO_SIZE GRAVITY

  FILE_PATH="$1"
  IMG_SIZE="$2"
  IMG_BG_COLOR="$3"
  LOGO_SIZE="$4"
  GRAVITY="$5"

  if [[ ! -f "${FILE_PATH}" ]]; then
    if [[ "${FILE_PATH##*.}" == "png" ]]; then
      convert -size "${IMG_SIZE}" "${IMG_BG_COLOR}" PNG32:"${FILE_PATH}"
    else
      convert -size "${IMG_SIZE}" "${IMG_BG_COLOR}" "${FILE_PATH}"
    fi

    rsvg-convert -w "${LOGO_SIZE}" -h "${LOGO_SIZE}" "icons/${QUALITY}/voidium_cnl.svg" -o "code_logo.png"

    if [[ "${GRAVITY}" == "center" ]]; then
      composite -gravity "${GRAVITY}" "code_logo.png" "${FILE_PATH}" "${FILE_PATH}"
    else
      composite -gravity NorthWest -geometry "${GRAVITY}" "code_logo.png" "${FILE_PATH}" "${FILE_PATH}"
    fi
  fi
} # }}}

build_windows_types() { # {{{
  mkdir -p "${SRC_PREFIX}src/${QUALITY}/resources/win32" "${SRC_PREFIX}build/windows/msi/resources/${QUALITY}"

  rsvg-convert -b "#F5F6F7" -w 64 -h 64 "icons/${QUALITY}/voidium_cnl.svg" -o "code_logo.png"

  for file in "${VSCODE_PREFIX}"vscode/resources/win32/*.ico; do
    if [[ -f "${file}" ]]; then
      name=$(basename "${file}" '.ico')

      if [[ "${name}" != 'code' ]] && [[ ! -f "${SRC_PREFIX}src/${QUALITY}/resources/win32/${name}.ico" ]]; then
        icotool -x -w 256 "${file}"

        composite -geometry +150+185 "code_logo.png" "${name}_1_256x256x32.png" "${name}.png"

        convert "${name}.png" -define icon:auto-resize=256,128,96,64,48,32,24,20,16 "${SRC_PREFIX}src/${QUALITY}/resources/win32/${name}.ico"

        rm "${name}_1_256x256x32.png" "${name}.png"
      fi
    fi
  done

  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/code_70x70.png" "70x70" "canvas:transparent" "45" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/code_150x150.png" "150x150" "canvas:transparent" "64" "+44+25"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-big-100.bmp" "164x314" "xc:white" "126" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-big-125.bmp" "192x386" "xc:white" "147" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-big-150.bmp" "246x459" "xc:white" "190" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-big-175.bmp" "273x556" "xc:white" "211" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-big-200.bmp" "328x604" "xc:white" "255" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-big-225.bmp" "355x700" "xc:white" "273" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-big-250.bmp" "410x797" "xc:white" "317" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-small-100.bmp" "55x55" "xc:white" "44" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-small-125.bmp" "64x68" "xc:white" "52" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-small-150.bmp" "83x80" "xc:white" "63" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-small-175.bmp" "92x97" "xc:white" "76" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-small-200.bmp" "110x106" "xc:white" "86" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-small-225.bmp" "119x123" "xc:white" "103" "center"
  build_windows_type "${SRC_PREFIX}src/${QUALITY}/resources/win32/inno-small-250.bmp" "138x140" "xc:white" "116" "center"
  build_windows_type "${SRC_PREFIX}build/windows/msi/resources/${QUALITY}/wix-banner.bmp" "493x58" "xc:white" "50" "+438+6"
  build_windows_type "${SRC_PREFIX}build/windows/msi/resources/${QUALITY}/wix-dialog.bmp" "493x312" "xc:white" "120" "+22+152"

  rm code_logo.png
} # }}}

if [[ "${0}" == "${BASH_SOURCE[0]}" ]]; then
  build_windows_main
  build_windows_types

  build_media
  build_server
fi
