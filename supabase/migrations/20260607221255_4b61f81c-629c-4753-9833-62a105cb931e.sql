
-- Deactivate content-duplicate gallery rows (same image bytes uploaded under different filenames).
-- Teaching STEM at Sowah: all 13 rows share md5 039af5e8... — keep 1 (799f1133), deactivate 12.
UPDATE public.gallery SET is_active = false WHERE id IN (
  '19417960-ae07-48aa-9321-48bc6b0edb61',
  '571c4871-9409-496f-92ca-a722fabd80a9',
  '2d3100d8-b073-4b17-8ee2-9e704cc10d82',
  'f4af725b-68f6-435d-a11d-8948213eb31f',
  '15dbb048-f208-4bbd-8c23-3911adbf67c4',
  '45240cb8-9bf4-4e19-b3dc-d2c91715dc06',
  '4f828ed8-e40f-4bde-904d-1102b86389a4',
  '0caf5210-4d7d-42a8-a6cb-461205064073',
  '511900fa-3978-40e5-b15a-7bade2963659',
  '1fab12aa-efe0-4434-ae67-73a2f99162a0',
  'b8b94b21-fae1-4e6f-b084-f781cbe8e5f4',
  '9f64597c-2a61-4308-8322-38b9c4372609',
  'ae3981d7-a305-4b32-985d-fc97813b346c',
  '3a4fdb92-2f9d-4117-ac4e-3b6e5a629c9f'
);

-- Siccator Solar Dryer: both rows share md5 8c1f6f8... — keep 343240a2, deactivate 64be8733.
UPDATE public.gallery SET is_active = false WHERE id = '64be8733-0c5f-40ba-b5a3-2353c088ec2d';
