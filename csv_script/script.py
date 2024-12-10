i = int(input("Enter file number: "))
name = f"Data{i}-0.csv"
orig_lines = []
lines = []
new_lines = []
with open(name, "r") as file:
    lines = file.readlines()
    orig_lines = lines.copy()

j = 0
while (j < 90):
    str_j = "{:.6f}".format(j)
    for line in lines:
        line = line.strip()
        l = line.split(",")
        l[1] = f"{i}?{str_j}"
        l[2] = str_j
        new_lines.append(",".join(l))

    with open(f"Data{i}-{str_j}.csv", "w") as file:
        file.write("\n".join(new_lines))
    new_lines = []
    lines = orig_lines.copy()

    j += 0.000018

j = -0.000018
while (j > -90):
    for line in lines:
        line = line.strip()
        l = line.split(",")
        l[1] = f"{i}?{str_j}"
        l[2] = str_j
        new_lines.append(",".join(l))

    with open(f"Data{i}-{str_j}.csv", "w") as file:
        file.write("\n".join(new_lines))
    new_lines = []
    lines = orig_lines.copy()
    

    j -= 0.000018