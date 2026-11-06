#!/bin/bash
# Full site build, always in this order. Usage: build.sh
set -e
S=/tmp/claude-0/-workspace/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad
G=/tmp/claude-0/-home-user-gugodavtyan555/8aeb4342-0200-5c82-93a5-effabca2f09f/scratchpad
cd /home/user/gugodavtyan555
python3 $G/gen.py
python3 $S/i18n.py
python3 $S/covers.py
python3 $S/seo.py
python3 $S/schema.py
