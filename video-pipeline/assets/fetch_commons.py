import json,re,subprocess,urllib.parse,sys,os,html
API='https://commons.wikimedia.org/w/api.php'
OK=re.compile(r'^(cc0|public domain|pd[- ]|cc[- ]by[- ]\d|cc by \d)',re.I)
BAD=re.compile(r'sa|nc|nd',re.I)      # reject ShareAlike / NonCommercial / NoDerivs
def get(params):
    u=API+'?'+urllib.parse.urlencode(params)
    r=subprocess.run(['curl','-sS','-m','60','-A','gta-gid-assets/1.0 (YouTube channel b-roll research)',u],capture_output=True,text=True)
    try: return json.loads(r.stdout)
    except Exception: return {}
def search(q,kind,limit=30):
    d=get({'action':'query','format':'json','generator':'search','gsrnamespace':6,'gsrsearch':f'{q} filetype:{kind}','gsrlimit':limit,'prop':'imageinfo','iiprop':'url|extmetadata|mime|size|dimensions','iiurlwidth':1920})
    out=[]
    for p in (d.get('query',{}).get('pages',{})).values():
        ii=(p.get('imageinfo') or [{}])[0]; md=ii.get('extmetadata',{})
        lic=(md.get('LicenseShortName',{}) or {}).get('value','')
        if not OK.search(lic) or re.search(r'\b(SA|NC|ND)\b',lic.upper()) or 'sa' in lic.lower().split('-'): continue
        if md.get('Restrictions',{}).get('value'): continue                    # personality/trademark/etc. restrictions flagged
        auth=re.sub(r'<[^>]+>','',(md.get('Artist',{}) or {}).get('value',''))
        out.append(dict(title=p['title'],url=ii.get('url'),thumb=ii.get('thumburl'),mime=ii.get('mime'),w=ii.get('width'),h=ii.get('height'),size=ii.get('size'),license=lic,author=html.unescape(auth)[:120],page=ii.get('descriptionurl')))
    return out
if __name__=='__main__':
    Q=['Miami skyline night','Miami Beach Ocean Drive art deco','Miami Beach lifeguard tower','Port of Miami cruise ships','Little Havana Miami','Florida Keys bridge aerial','Everglades airboat','Florida mangrove','Florida palm trees sunset','Miami Wynwood graffiti mural','Miami boat marina yachts','Florida swamp alligator','neon sign night street','Miami highway traffic','Biscayne Bay sunset']
    res={}
    for q in Q:
        for kind in ('bitmap','video'):
            for r in search(q,kind): res[r['title']]=dict(r,query=q,kind=kind)
    json.dump(res,open('found.json','w'),ensure_ascii=False,indent=1)
    from collections import Counter
    print(len(res),Counter(v['kind'] for v in res.values()),Counter(v['license'] for v in res.values()).most_common(8))
