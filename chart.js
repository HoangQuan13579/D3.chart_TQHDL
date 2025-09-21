// ======================= Chart 1: Doanh số theo Mặt hàng =======================
const margin = { top: 50, right: 250, bottom: 50, left: 250 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data.csv").then(function(data) {

  // Gom nhóm doanh số + số lượng theo mặt hàng
  const doanhso = d3.rollups(
    data,
    v => ({
      sum: d3.sum(v, d => +d["Thành tiền"]),
      qty: d3.sum(v, d => +d["SL"]),   // số lượng SKU
      group: `[${v[0]["Mã nhóm hàng"]}] ${v[0]["Tên nhóm hàng"]}`
    }),
    d => `[${d["Mã mặt hàng"]}] ${d["Tên mặt hàng"]}`
  );

  // Sắp xếp giảm dần
  doanhso.sort((a, b) => d3.descending(a[1].sum, b[1].sum));

  // Thang đo X (doanh số)
  const x = d3.scaleLinear()
    .domain([0, d3.max(doanhso, d => d[1].sum)])
    .range([0, width]);

  // Thang đo Y (mặt hàng)
  const y = d3.scaleBand()
    .domain(doanhso.map(d => d[0]))
    .range([0, height])
    .padding(0.1);

  // Thang màu cho Nhóm hàng (legend)
  const groups = Array.from(new Set(doanhso.map(d => d[1].group)));
  const colorGroup = d3.scaleOrdinal(d3.schemeCategory10).domain(groups);

  // Trục Y
  svg.append("g").call(d3.axisLeft(y));

  // Trục X
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .ticks(6)
        .tickFormat(d => d3.format(".2s")(d).replace("M", "M"))
    );

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #999")
    .style("padding", "6px 10px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("box-shadow", "0px 0px 6px rgba(0,0,0,0.3)")
    .style("visibility", "hidden");

  // Vẽ cột (màu theo Nhóm hàng)
  svg.selectAll("rect")
    .data(doanhso)
    .enter()
    .append("rect")
    .attr("y", d => y(d[0]))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d[1].sum))
    .attr("fill", d => colorGroup(d[1].group))
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(
          `<b>Mặt hàng:</b> ${d[0]}<br>
           <b>Nhóm hàng:</b> ${d[1].group}<br>
           <b>Doanh số:</b> ${d3.format(",.0f")(d[1].sum / 1e6)}M<br>
           <b>SL:</b> ${d3.format(",")(d[1].qty)} SKUs`
        );
    })
    .on("mousemove", (event) => {
      tooltip.style("top", (event.pageY - 10) + "px")
             .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  // Nhãn giá trị (xxx triệu VND)
  svg.selectAll("text.label")
    .data(doanhso)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => x(d[1].sum) + 5)
    .attr("y", d => y(d[0]) + y.bandwidth() / 2 + 5)
    .text(d => `${d3.format(",.0f")(d[1].sum / 1e6)} triệu VND`);

  // Legend theo Nhóm hàng
  const legend = svg.append("g")
    .attr("transform", `translate(${width + 90}, 0)`);

  groups.forEach((g, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    row.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", colorGroup(g));

    row.append("text")
      .attr("x", 24)
      .attr("y", 14)
      .style("font-size", "13px")
      .text(g);
  });
});
// ======================= Chart 2: Doanh số theo Nhóm hàng =======================
d3.csv("data.csv").then(function(data) {
  const grouped = d3.rollups(
    data,
    v => ({
      sum: d3.sum(v, d => +d["Thành tiền"]),
      qty: d3.sum(v, d => +d["SL"])
    }),
    d => `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`
  );

  grouped.sort((a, b) => d3.descending(a[1].sum, b[1].sum));

  const margin = { top: 50, right: 200, bottom: 50, left: 250 },
        width = 1100 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(grouped, d => d[1].sum)])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(grouped.map(d => d[0]))
    .range([0, height])
    .padding(0.2);

  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(grouped.map(d => d[0]));

  svg.append("g").call(d3.axisLeft(y));

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x).ticks(6).tickFormat(d => `${d/1e6}M`)
    );

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #999")
    .style("padding", "6px 10px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("box-shadow", "0px 0px 6px rgba(0,0,0,0.3)")
    .style("visibility", "hidden");

  svg.selectAll("rect")
    .data(grouped)
    .enter()
    .append("rect")
    .attr("y", d => y(d[0]))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d[1].sum))
    .attr("fill", d => color(d[0]))
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(
          `<b>Nhóm hàng:</b> ${d[0]}<br>
           <b>Doanh số:</b> ${d3.format(".0f")(d[1].sum/1e6)} M<br>
           <b>SL:</b> ${d3.format("")(d[1].qty)} SKUs`
        );
    })
    .on("mousemove", (event) => {
      tooltip.style("top", (event.pageY - 10) + "px")
             .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  svg.selectAll("text.value")
    .data(grouped)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", d => x(d[1].sum) + 5)
    .attr("y", d => y(d[0]) + y.bandwidth()/2 + 4)
    .style("text-anchor", "start")
    .text(d => `${d3.format(",.0f")(d[1].sum/1e6)} triệu`);
});

// ======================= Chart 3: Doanh số theo Tháng =======================
d3.csv("data.csv").then(function(data) {
  // Gom nhóm theo tháng 
  const doanhsoThang = d3.rollups(
    data,
    v => ({
      sum: d3.sum(v, d => +d["Thành tiền"]),
      qty: d3.sum(v, d => +d["SL"])
    }),
    d => d3.timeFormat("%m")(new Date(d["Thời gian tạo đơn"])) // lấy tháng (01-12)
  );

  // Sort theo tháng (01 → 12)
  doanhsoThang.sort((a, b) => d3.ascending(+a[0], +b[0]));

  const margin = { top: 80, right: 150, bottom: 100, left: 120 },
        width = 1300 - margin.left - margin.right,
        height =550 - margin.top - margin.bottom;

  const svg = d3.select("#chart3")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Thang đo X (tháng)
  const x = d3.scaleBand()
    .domain(doanhsoThang.map(d => d[0]))
    .range([0, width])
    .padding(0.3);

  // Thang đo Y (doanh số)
  const y = d3.scaleLinear()
    .domain([0, d3.max(doanhsoThang, d => d[1].sum)])
    .nice()
    .range([height, 0]);

  // Thang màu
  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(doanhsoThang.map(d => d[0]));

  // Trục X
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .tickFormat(d => `Tháng ${String(d).padStart(2, '0')}`)
    )
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "10px");

  // Trục Y
  svg.append("g")
    .call(
      d3.axisLeft(y)
        .ticks(8)
        .tickFormat(d => `${d/1e6} triệu VND`)
    )
    .selectAll("text")
    .style("font-size", "10px");

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "8px 12px")
    .style("border-radius", "6px")
    .style("font-size", "14px")
    .style("box-shadow", "0px 2px 8px rgba(0,0,0,0.3)")
    .style("visibility", "hidden");

  // Cột
  svg.selectAll("rect")
    .data(doanhsoThang)
    .enter()
    .append("rect")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1].sum))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d[1].sum))
    .attr("fill", d => color(d[0]))
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(
          `<b>Tháng:</b> ${d[0]}<br>
           <b>Doanh số bán:</b> ${d3.format(",.0f")(d[1].sum/1e6)} triệu VND<br>
           <b>SL:</b> ${d3.format(",")(d[1].qty)} SKUs`
        );
    })
    .on("mousemove", (event) => {
      tooltip.style("top", (event.pageY - 20) + "px")
             .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  // Nhãn giá trị trên cột
  svg.selectAll("text.value")
    .data(doanhsoThang)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", d => x(d[0]) + x.bandwidth()/2)
    .attr("y", d => y(d[1].sum) - 6)
    .style("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "600")
    .text(d => `${d3.format(",.0f")(d[1].sum/1e6)} triệu VND`);
});


///////////////////////////////////////////////////// Chart 4: Doanh số TB theo ngày trong tuần
d3.csv("data.csv").then(function(data) {
  // Parse ngày
  const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
  data.forEach(d => {
    d.date = parseDate(d["Thời gian tạo đơn"]);
    d.value = +d["Thành tiền"];
    d.qty = +d["SL"];
  });

  // Gom theo ngày trong tuần (0=Chủ nhật, 1=Thứ hai,...)
  const weekDays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

  // Tính trung bình theo ngày DISTINCT
  const grouped = d3.rollups(
    data,
    v => {
      const totalValue = d3.sum(v, d => d.value);
      const totalQty   = d3.sum(v, d => d.qty);
      const distinctDays = new Set(v.map(d => d3.timeFormat("%Y-%m-%d")(d.date))).size;
      return {
        avgValue: totalValue / 1e6 / distinctDays, // triệu VND
        avgQty: totalQty / distinctDays
      };
    },
    d => d.date.getDay()
  );

  // Chuyển sang dataset [{day: ..., avgValue:..., avgQty:...}]
  const dataset = grouped.map(d => ({
    day: weekDays[d[0]],
    avgValue: d[1].avgValue,
    avgQty: d[1].avgQty
  }));

  // Sắp xếp lại theo thứ tự từ Thứ Hai → Chủ Nhật
  const order = [1,2,3,4,5,6,0];
  dataset.sort((a,b) => order.indexOf(weekDays.indexOf(a.day)) - order.indexOf(weekDays.indexOf(b.day)));

  // Margin setup
  const margin = { top: 50, right: 200, bottom: 150, left: 250},
        width = 1300 - margin.left - margin.right,
        height =600 - margin.top - margin.bottom;

  const svg = d3.select("#chart4")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale
  const x = d3.scaleBand()
    .domain(dataset.map(d => d.day))
    .range([0, width])
    .padding(0.2);

  // Y scale (theo doanh số TB)
  const y = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.avgValue) * 1.1])
    .nice()
    .range([height, 0]);

  // Color
  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(dataset.map(d => d.day));

  // Vẽ trục
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(
      d3.axisLeft(y)
        .ticks(8)
        .tickFormat(d => d.toFixed(0) + "M")
    );

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #999")
    .style("padding", "6px 10px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("box-shadow", "0px 0px 6px rgba(0,0,0,0.3)")
    .style("visibility", "hidden");

  // Vẽ cột
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", d => x(d.day))
    .attr("y", d => y(d.avgValue))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.avgValue))
    .attr("fill", d => color(d.day))
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(
          `<b>Ngày:</b> ${d.day}<br>
           <b>Thành tiền (TB):</b> ${d.avgValue.toFixed(1)} M<br>
           <b>SL (TB):</b> ${d3.format(",.0f")(d.avgQty)} SKUs`
        );
    })
    .on("mousemove", (event) => {
      tooltip.style("top", (event.pageY - 10) + "px")
             .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  // Nhãn dữ liệu
  svg.selectAll("text.value")
    .data(dataset)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", d => x(d.day) + x.bandwidth()/2)
    .attr("y", d => y(d.avgValue) - 5)
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .text(d => `${d.avgValue.toFixed(1)} triệu VND`);
});

////////////////////// Chart5 (Doanh số theo ngày trong tháng) //////////////////////
d3.csv("data.csv").then(function(data) {
  // Parse ngày
  const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
  data.forEach(d => {
    d.date = parseDate(d["Thời gian tạo đơn"]);
    d.value = +d["Thành tiền"];
    d.qty = +d["SL"];
  });

  // Gom theo ngày trong tháng (1-31)
  const grouped = d3.rollups(
    data,
    v => {
      const totalValue = d3.sum(v, d => d.value);
      const totalQty   = d3.sum(v, d => d.qty);
      const distinctDays = new Set(v.map(d => d3.timeFormat("%Y-%m-%d")(d.date))).size || 1;
      return {
        avgValue: totalValue / 1e6 / distinctDays, // triệu VND
        avgQty: totalQty / distinctDays
      };
    },
    d => d.date.getDate()
  );

  // Dataset
  const dataset = grouped.map(d => ({
    day: d[0],
    avgValue: d[1].avgValue,
    avgQty: d[1].avgQty
  }));

  dataset.sort((a, b) => a.day - b.day);

  // Margin setup
  const margin = { top: 50, right: 120, bottom: 80, left: 100 },
        width = 1600 - margin.left - margin.right,
        height =650 - margin.top - margin.bottom;

  // Remove cũ nếu có
  d3.select("#chart5").select("svg").remove();

  const svg = d3.select("#chart5")   
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")   // căn giữa
    .style("margin", "0 auto")   // căn giữa
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale
  const x = d3.scaleBand()
    .domain(dataset.map(d => d.day))
    .range([0, width])
    .padding(0.1); // bar rộng hơn

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.avgValue) * 1.12])
    .nice()
    .range([height, 0]);

  // Color
  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(dataset.map(d => d.day));

  // Trục X (Ngày 01, Ngày 02, ...)
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .tickValues(d3.range(1, 32))
        .tickFormat(d => "Ngày " + String(d).padStart(2, "0"))
    )
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "11px");  // chữ to, không nghiêng

  // Trục Y (triệu VND, thêm "M")
  svg.append("g")
    .call(
      d3.axisLeft(y)
        .ticks(8)
        .tickFormat(d => d.toFixed(0) + "M")
    )
    .selectAll("text")
    .style("font-size", "11px");

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "chart-tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #999")
    .style("padding", "8px 10px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.25)")
    .style("visibility", "hidden");

  // Vẽ cột
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", d => x(d.day))
    .attr("y", d => y(d.avgValue))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.avgValue))
    .attr("fill", d => color(d.day))
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(
          `<b>Ngày:</b> ${String(d.day).padStart(2,"0")}<br>
           <b>Doanh số TB:</b> ${d.avgValue.toFixed(1)} M<br>
           <b>SL TB:</b> ${d3.format(",.0f")(d.avgQty)} SKUs`
        );
    })
    .on("mousemove", (event) => {
      tooltip.style("top", (event.pageY - 10) + "px")
             .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  // Nhãn dữ liệu trên cột
  svg.selectAll("text.value")
    .data(dataset)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", d => x(d.day) + x.bandwidth() / 2)
    .attr("y", d => y(d.avgValue) - 8)
    .style("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "600")
    .text(d => `${d.avgValue.toFixed(1)} M`);
});


// ======================= Chart: Doanh số theo Khung giờ (centered, wider bars) =======================
d3.csv("data.csv").then(function(data) {
  // Parse ngày giờ
  const parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
  data.forEach(d => {
    d.date = parseDate(d["Thời gian tạo đơn"]);
    d.value = +d["Thành tiền"];
    d.sl = +d["SL"];
  });

  // Gom nhóm theo giờ
  const grouped = d3.rollups(
    data,
    v => {
      const total = d3.sum(v, d => d.value);
      const totalSL = d3.sum(v, d => d.sl);
      const distinctDays = new Set(v.map(d => d3.timeFormat("%Y-%m-%d")(d.date))).size || 1;
      return {
        avgValue: total / distinctDays,
        avgSL: totalSL / distinctDays
      };
    },
    d => d.date.getHours()
  );

  // Dataset [{hour, khunggio, avgValue, avgSL}]
  const dataset = grouped.map(([hour, stats]) => {
    const hh = String(hour).padStart(2, "0");
    return {
      hour: hour,
      khunggio: `${hh}:00 - ${hh}:59`,
      avgValue: stats.avgValue,
      avgSL: stats.avgSL
    };
  });

  // Sort theo giờ
  dataset.sort((a, b) => a.hour - b.hour);

  // Remove previous svg if exists (safe redeploy)
  d3.select("#chart6").select("svg").remove();

  // Margin & size
  const margin = { top: 60, right: 260, bottom: 160, left: 100 },
        width = 1500 - margin.left - margin.right,
        height =700 - margin.top - margin.bottom;

  const svg = d3.select("#chart6")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // center the svg element horizontally
    .style("display", "block")
    .style("margin", "0 auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale (smaller padding => wider bars)
  const x = d3.scaleBand()
    .domain(dataset.map(d => d.khunggio))
    .range([0, width])
    .padding(0.08);   // bar rộng hơn

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.avgValue) * 1.12])
    .nice()
    .range([height, 0]);

  // Color (one color palette; can change)
  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(dataset.map(d => d.khunggio));

  // Trục X
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "12px"); // chữ to hơn

  // Trục Y (format thành K)
  svg.append("g")
    .call(
      d3.axisLeft(y)
        .ticks(8)
        .tickFormat(d => `${Math.round(d/1000)}K`)
    )
    .selectAll("text")
    .style("font-size", "12px"); // chữ to hơn

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "chart-tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid rgba(0,0,0,0.12)")
    .style("padding", "8px 10px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.12)")
    .style("opacity", 0)
    .style("font-size", "13px");

  // Vẽ cột
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", d => x(d.khunggio))
    .attr("y", d => y(d.avgValue))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.avgValue))
    .attr("fill", d => color(d.khunggio))
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(140).style("opacity", 0.98);
      tooltip.html(`
        <strong>Khung giờ:</strong> ${d.khunggio}<br/>
        <strong>SL (trung bình):</strong> ${d3.format(",.0f")(d.avgSL)} SKUs<br/>
        <strong>Doanh số bán (trung bình):</strong> ${d3.format(",.0f")(d.avgValue/1000)} K
      `)
      .style("left", (event.pageX + 16) + "px")
      .style("top", (event.pageY - 34) + "px");
      d3.select(this).attr("opacity", 0.85);
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 16) + "px")
             .style("top", (event.pageY - 34) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(220).style("opacity", 0);
      d3.select(this).attr("opacity", 1);
    });

  // Nhãn dữ liệu trên cột (đẩy cao hơn, chữ to hơn)
  svg.selectAll("text.value")
    .data(dataset)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", d => x(d.khunggio) + x.bandwidth() / 2)
    .attr("y", d => y(d.avgValue) - 12) // đẩy lên trên hơn
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .style("font-weight", "600")
    .text(d => `${d3.format(",.0f")(d.avgValue)} VNĐ`);
});

//////////////chart 7////////////////////////
d3.csv("data.csv").then(function(data) {
  // Chuẩn hóa
  data.forEach(d => {
    d["Mã đơn hàng"] = d["Mã đơn hàng"];
    d["Mã nhóm hàng"] = d["Mã nhóm hàng"];
    d["Tên nhóm hàng"] = d["Tên nhóm hàng"];
  });

  // Tổng số đơn hàng DISTINCT
  const totalOrders = new Set(data.map(d => d["Mã đơn hàng"])).size;

  // Gom nhóm theo nhóm hàng
  const grouped = d3.rollups(
    data,
    v => new Set(v.map(d => d["Mã đơn hàng"])).size,
    d => `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`
  );

  // Dataset
  const dataset = grouped.map(d => ({
    group: d[0],
    orders: d[1],
    prob: d[1] / totalOrders
  }));

  dataset.sort((a, b) => d3.descending(a.prob, b.prob));

  // Margin + size
  const margin = { top: 50, right: 150, bottom: 60, left: 250 },
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart7")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "0 auto")   // Căn giữa chart
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scale
  const x = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.prob) * 1.1])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(dataset.map(d => d.group))
    .range([0, height])
    .padding(0.25);

  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(dataset.map(d => d.group));

  // Axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format(".0%")))
    .selectAll("text")
    .style("font-size", "12px");

  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .style("font-size", "12px");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "8px 12px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.2)")
    .style("pointer-events", "none")
    .style("font-size", "13px")
    .style("opacity", 0);

  // Bars
  svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.group))
    .attr("width", d => x(d.prob))
    .attr("height", y.bandwidth())
    .attr("fill", d => color(d.group))
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        <strong>Nhóm hàng:</strong> ${d.group}<br/>
        <strong>SL đơn bán:</strong> ${d.orders} SKUs<br/>
        <strong>Xác suất bán:</strong> ${(d.prob*100).toFixed(1)}%
      `)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
      d3.select(this).attr("opacity", 0.85);
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 15) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(200).style("opacity", 0);
      d3.select(this).attr("opacity", 1);
    });

  // Nhãn phần trăm
  svg.selectAll("text.value")
    .data(dataset)
    .enter()
    .append("text")
    .attr("class", "value")
    .attr("x", d => x(d.prob) + 8)
    .attr("y", d => y(d.group) + y.bandwidth()/2 + 4)
    .text(d => (d.prob*100).toFixed(1) + "%")
    .style("font-size", "12px")
    .style("fill", "black")
    .style("alignment-baseline", "middle");
});

/////////////////////chart8////////////////////
d3.csv("data.csv").then(function(data) {
  // Chuẩn hóa dữ liệu
  data.forEach(d => {
    const dt = new Date(d["Thời gian tạo đơn"].replace(" ", "T"));
    const mm = dt.getMonth() + 1;

    d.ThangSo = mm;
    d.Thang = "T" + String(mm).padStart(2,"0");  // đổi gọn như Tableau
    d.NhomHang = `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`;
    d.MaDon = d["Mã đơn hàng"];
  });

  // Gom nhóm: (Tháng, Nhóm hàng) -> số đơn distinct
  const grouped = d3.rollups(
    data,
    v => new Set(v.map(d => d.MaDon)).size,
    d => d.ThangSo,
    d => d.NhomHang
  );

  // Tổng đơn theo tháng
  const totalByMonth = d3.rollups(
    data,
    v => new Set(v.map(d => d.MaDon)).size,
    d => d.ThangSo
  );

  // Dataset
  let dataset = [];
  grouped.forEach(([month, groups]) => {
    const tong = totalByMonth.find(([m]) => m === month)[1];
    groups.forEach(([group, orders]) => {
      dataset.push({
        ThangSo: month,
        Thang: "T" + String(month).padStart(2,"0"),
        NhomHang: group,
        Orders: orders,
        Prob: orders / tong
      });
    });
  });

  const groups = Array.from(new Set(dataset.map(d => d.NhomHang)));

  const series = groups.map(g => ({
    group: g,
    values: dataset.filter(d => d.NhomHang === g)
                   .sort((a,b) => d3.ascending(a.ThangSo, b.ThangSo))
  }));

  // Margin + size
  const margin = { top: 80, right: 200, bottom: 70, left: 80 },
        width = 1100 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart8")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "0 auto")   // căn giữa
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scale
  const x = d3.scaleLinear()
    .domain([1,12])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.Prob)*1.1])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal(d3.schemeTableau10).domain(groups);

  // Axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(12).tickFormat(d => "Tháng " + String(d).padStart(2,"0")))
    .selectAll("text")
    .style("text-anchor","middle");

  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "8px 12px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.2)")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Line generator
  const line = d3.line()
    .x(d => x(d.ThangSo))
    .y(d => y(d.Prob));

  // Vẽ line
  svg.selectAll(".line")
    .data(series)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", d => color(d.group))
    .attr("stroke-width", 2)
    .attr("d", d => line(d.values));

  // Vẽ điểm marker
  svg.selectAll(".points")
    .data(series.flatMap(s => s.values.map(v => ({...v, group:s.group}))))
    .enter()
    .append("circle")
    .attr("cx", d => x(d.ThangSo))
    .attr("cy", d => y(d.Prob))
    .attr("r", 4)
    .attr("fill", d => color(d.group))
    .on("mouseover", function(event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        Tháng: ${d.Thang}<br/>
        Nhóm hàng: ${d.NhomHang}<br/>
        SL đơn bán: ${d.Orders}<br/>
        Xác suất bán: ${(d.Prob*100).toFixed(1)}%
      `)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
      tooltip.style("left", (event.pageX + 15) + "px")
             .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // Legend (gọn và đẹp hơn)
  const legend = svg.append("g")
    .attr("transform", `translate(${width+20},20)`);

  groups.forEach((g, i) => {
    const yPos = i*22;
    legend.append("circle")
      .attr("cx", 0).attr("cy", yPos)
      .attr("r", 6)
      .style("fill", color(g));
    legend.append("text")
      .attr("x", 12).attr("y", yPos+4)
      .text(g)
      .style("font-size", "12px")
      .style("fill","#333")
      .attr("alignment-baseline","middle");
  });
});

/////////////////chart9/////////////////
d3.csv("data.csv").then(data => {
  data.forEach(d => {
    d["Thời gian tạo đơn"] = new Date(d["Thời gian tạo đơn"]);
  });

  // Gom số đơn theo nhóm
  const groupOrders = d3.rollups(
    data,
    v => new Set(v.map(d => d["Mã đơn hàng"])).size,
    d => `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`
  );
  const groupMap = new Map(groupOrders);

  // Gom số đơn theo từng mặt hàng trong nhóm
  const itemOrders = d3.rollups(
    data,
    v => new Set(v.map(d => d["Mã đơn hàng"])).size,
    d => `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`,
    d => `[${d["Mã mặt hàng"]}] ${d["Tên mặt hàng"]}`
  );

  // Dataset đầy đủ
  let dataset = [];
  itemOrders.forEach(([group, items]) => {
    const totalGroup = groupMap.get(group) || 1;
    items.forEach(([item, count]) => {
      dataset.push({
        group,
        item,
        count,
        probability: count / totalGroup
      });
    });
  });

  // Nhóm hàng sắp xếp theo layout mong muốn
  const groupOrder = [
    "[BOT] Bột",
    "[SET] Set trà",
    "[THO] Trà hoa",
    "[TMX] Trà mix",
    "[TTC] Trà củ, quả sấy"
  ];

  const margin = { top: 40, right: 20, bottom: 40, left: 180 },
        width = 450 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

  // Màu theo mặt hàng
  const items = [...new Set(dataset.map(d=>d.item))];
  const color = d3.scaleOrdinal()
    .domain(items)
    .range(d3.schemeTableau10.concat(d3.schemeSet3));

  // Container chính (grid layout)
  const container = d3.select("#chart9")
    .style("display","grid")
    .style("grid-template-columns","repeat(3,1fr)")
    .style("gap","40px")
    .style("row-gap","60px");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class","tooltip")
    .style("position","absolute")
    .style("padding","8px 12px")
    .style("background","#fff")
    .style("border","1px solid #ccc")
    .style("border-radius","6px")
    .style("box-shadow","0 2px 6px rgba(0,0,0,0.2)")
    .style("font-size","13px")
    .style("opacity",0);

  // Vẽ chart nhỏ cho từng nhóm
  groupOrder.forEach((group,i) => {
    const dataGroup = dataset.filter(d => d.group === group)
      .sort((a,b)=> d3.descending(a.probability,b.probability));

    // mỗi chart nằm trong 1 div riêng để grid quản lý
    const chartDiv = container.append("div")
      .style("width", (width + margin.left + margin.right) + "px")
      .style("height", (height + margin.top + margin.bottom) + "px");

    const svg = chartDiv.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform",`translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand()
      .domain(dataGroup.map(d => d.item))
      .range([0, height])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(dataGroup,d=>d.probability)])
      .nice()
      .range([0, width]);

    // Trục
    g.append("g").call(d3.axisLeft(y).tickSize(0).tickPadding(5));
    g.append("g")
      .attr("transform",`translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".0%")));

    // Bars
    g.selectAll("rect")
      .data(dataGroup)
      .enter().append("rect")
      .attr("y", d=>y(d.item))
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", d=>x(d.probability))
      .attr("fill", d => color(d.item))
      .on("mouseover",(event,d)=>{
        tooltip.style("opacity",1)
          .html(`
            Nhóm: <b>${d.group}</b><br>
            Mặt hàng: <b>${d.item}</b><br>
            Số đơn bán: ${d.count}<br>
            Xác suất bán: ${d3.format(".1%")(d.probability)}
          `)
          .style("left",(event.pageX+12)+"px")
          .style("top",(event.pageY-28)+"px");
      })
      .on("mouseout",()=>tooltip.style("opacity",0));

    // Label %
    g.selectAll(".label")
      .data(dataGroup)
      .enter().append("text")
      .attr("class","label")
      .attr("x", d => x(d.probability) - 5)
      .attr("y", d => y(d.item) + y.bandwidth()/2 )
      .attr("alignment-baseline","middle")
      .attr("text-anchor","end")
      .style("fill","white")
      .style("font-weight","bold")
      .style("font-size","11px")
      .text(d => d3.format(".1%")(d.probability));

    // Tiêu đề nhóm
    svg.append("text")
      .attr("x",(width+margin.left+margin.right)/2)
      .attr("y",20)
      .attr("text-anchor","middle")
      .style("font-size","16px")
      .style("font-weight","bold")
      .style("fill","#007777")
      .text(group);
  });
});

///////////////////// chart10 - XÁC SUẤT BÁN HÀNG CỦA MẶT HÀNG TRONG TỪNG THÁNG ////////////////////
d3.csv("data.csv").then(function(data) {
  // --- ensure container #chart10 is a DIV ---
  const existing = d3.select("#chart10");
  if (existing.empty()) {
    console.error("#chart10 not found in page");
    return;
  }
  if (existing.node().tagName && existing.node().tagName.toLowerCase() === "svg") {
    const parent = existing.node().parentNode;
    existing.remove();
    d3.select(parent).append("div").attr("id", "chart10");
  }
  const container = d3.select("#chart10");
  container.html(""); // clear

  // --- Parse & normalize rows ---
  data.forEach(d => {
    let s = d["Thời gian tạo đơn"];
    if (typeof s === "string" && s.indexOf(" ") !== -1 && s.indexOf("T") === -1) s = s.replace(" ", "T");
    const dt = new Date(s);
    if (isNaN(dt)) d.__date = new Date(d["Thời gian tạo đơn"]);
    else d.__date = dt;

    d.monthNum = d.__date && !isNaN(d.__date) ? (d.__date.getMonth() + 1) : null;
    d.group = `[${d["Mã nhóm hàng"]}] ${d["Tên nhóm hàng"]}`;
    d.item  = `[${d["Mã mặt hàng"]}] ${d["Tên mặt hàng"]}`;
    d.order = d["Mã đơn hàng"];
  });

  // --- Aggregations ---
  const denomRoll = d3.rollups(
    data.filter(d => d.monthNum != null),
    v => new Set(v.map(d => d.order)).size,
    d => d.monthNum,
    d => d.group
  );
  const denomMap = new Map();
  denomRoll.forEach(([m, groups]) => {
    groups.forEach(([g, cnt]) => denomMap.set(`${m}|${g}`, cnt));
  });

  const numerRoll = d3.rollups(
    data.filter(d => d.monthNum != null),
    v => new Set(v.map(d => d.order)).size,
    d => d.monthNum,
    d => d.group,
    d => d.item
  );
  const numerMap = new Map();
  numerRoll.forEach(([m, groups]) => {
    groups.forEach(([g, items]) => {
      items.forEach(([it, cnt]) => numerMap.set(`${m}|${g}|${it}`, cnt));
    });
  });

  const groupOrderDesired = [
    "[BOT] Bột",
    "[SET] Set trà",
    "[THO] Trà hoa",
    "[TMX] Trà mix",
    "[TTC] Trà củ, quả sấy"
  ];
  const allGroups = Array.from(new Set(data.map(d => d.group).filter(Boolean)));
  const groupsSorted = groupOrderDesired.filter(g => allGroups.includes(g))
                        .concat(allGroups.filter(g => !groupOrderDesired.includes(g)));

  const allItems = Array.from(new Set(data.map(d => d.item).filter(Boolean)));

  const monthList = d3.range(1,13);
  const groupedSeries = [];
  allGroups.forEach(g => {
    const itemsInGroup = Array.from(new Set(data.filter(d => d.group === g).map(d => d.item))).filter(Boolean);
    itemsInGroup.forEach(it => {
      const values = monthList.map(m => {
        const cnt = numerMap.get(`${m}|${g}|${it}`) || 0;
        const denom = denomMap.get(`${m}|${g}`) || 0;
        const prob = denom === 0 ? 0 : cnt / denom;
        return { month: m, count: cnt, denom: denom, prob: prob };
      });
      groupedSeries.push({ group: g, item: it, values });
    });
  });

  // --- Layout ---
  const cols = 3;
  const facetW = 500;
  const facetH = 300;
  const margin = { top: 36, right: 46, bottom: 60, left: 50 };

  const color = d3.scaleOrdinal()
    .domain(allItems)
    .range(d3.schemeTableau10.concat(d3.schemeSet3));

  container
    .style("display", "grid")
    .style("grid-template-columns", `repeat(${cols}, ${facetW}px)`)
    .style("gap", "18px 18px")
    .style("align-items", "start");

  groupsSorted.forEach(groupName => {
    const seriesForGroup = groupedSeries.filter(s => s.group === groupName);
    const maxProb = d3.max(seriesForGroup, s => d3.max(s.values, v => v.prob)) || 0.01;

    const svg = container.append("svg")
      .attr("width", facetW)
      .attr("height", facetH)
      .style("background", "#fff")
      .style("border", "1.2px solid #cce5f2")
      .style("border-radius", "8px")
      .style("box-shadow", "0 1px 2px rgba(0,0,0,0.04)");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const innerW = facetW - margin.left - margin.right;
    const innerH = facetH - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([1,12]).range([0, innerW]);
    const xAxis = d3.axisBottom(x).ticks(12).tickFormat(d => "T" + String(d).padStart(2,"0"));
    const y = d3.scaleLinear().domain([0, Math.max(0.01, maxProb) * 1.12]).range([innerH, 0]);

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text").style("font-size", "11px");

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .selectAll("text").style("font-size", "11px");

    svg.append("rect")
      .attr("x", 0).attr("y", 0)
      .attr("width", facetW).attr("height", margin.top + 4)
      .attr("fill", "#f1f8fb").attr("stroke", "#cce5f2");

    svg.append("text")
      .attr("x", facetW / 2).attr("y", margin.top / 1.6)
      .attr("text-anchor", "middle")
      .style("font-size", "14px").style("font-weight", "600").style("fill", "#004c6d")
      .text(groupName);

    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.prob));

    seriesForGroup.forEach(s => {
      g.append("path")
        .datum(s.values)
        .attr("fill", "none")
        .attr("stroke", color(s.item))
        .attr("stroke-width", 1.8)
        .attr("d", line);

      g.selectAll(null)
        .data(s.values).enter()
        .append("circle")
        .attr("cx", d => x(d.month))
        .attr("cy", d => y(d.prob))
        .attr("r", 2.8)
        .attr("fill", color(s.item))
        .on("mouseover", (ev, d) => {
          tooltip.transition().duration(120).style("opacity", 1);
          tooltip.html(
            `Tháng ${String(d.month).padStart(2,"0")}<br/>
             Nhóm hàng: <b>${groupName}</b><br/>
             Mặt hàng: <b>${s.item}</b><br/>
             SL đơn bán: ${d.count}<br/>
             Xác suất: ${d3.format(".1%")(d.prob)}`
          )
          .style("left", (ev.pageX + 14) + "px")
          .style("top", (ev.pageY - 28) + "px");
        })
        .on("mousemove", ev => tooltip
          .style("left", (ev.pageX + 14) + "px")
          .style("top", (ev.pageY - 28) + "px"))
        .on("mouseout", () => tooltip.transition().duration(120).style("opacity", 0));
    });
  });

  // tooltip (chung toàn chart)
  const tooltip = d3.select("body").append("div")
    .attr("class", "chart-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "8px 10px")
    .style("border-radius", "6px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)")
    .style("opacity", 0)
    .style("font-size", "12px");
});
///////////////////// chart11 - PHÂN PHỐI LƯỢT MUA HÀNG ////////////////////
d3.csv("data.csv").then(function(data) {
  data.forEach(d => {
    d.customer = d["Mã khách hàng"];
    d.order = d["Mã đơn hàng"];
  });

  // --- bước 1: số lần mua theo khách hàng ---
  const customerOrders = d3.rollups(
    data,
    v => new Set(v.map(d => d.order)).size,
    d => d.customer
  );

  // --- bước 2: số KH theo số lần mua ---
  const dist = d3.rollups(
    customerOrders,
    v => v.length,
    d => d[1]
  )
  .map(([times, cnt]) => ({ times: +times, customers: cnt }))
  .sort((a,b) => d3.ascending(a.times, b.times));

  // --- chart size ---
  const width = 950, height = 500;
  const margin = {top: 70, right: 30, bottom: 80, left: 70};

  // bọc chart trong div để căn giữa
  const container = d3.select("#chart11").append("div")
    .style("text-align","center");
  
  const svg = container.append("svg")
    .attr("id","#chart11")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // --- scales ---
  const x = d3.scaleBand()
    .domain(dist.map(d => d.times))
    .range([0, innerW])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(dist, d => d.customers)]).nice()
    .range([innerH, 0]);

  // --- axes ---
  g.append("g")
    .attr("transform",`translate(0,${innerH})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  g.append("g")
    .call(d3.axisLeft(y));

  // --- tooltip ---
  const tooltip = container.append("div")
    .style("position","absolute")
    .style("background","#fff")
    .style("border","1px solid #ccc")
    .style("padding","6px 10px")
    .style("border-radius","4px")
    .style("box-shadow","0px 2px 6px rgba(0,0,0,0.15)")
    .style("font-size","13px")
    .style("pointer-events","none")
    .style("opacity",0);

  // --- bars ---
  g.selectAll(".bar")
    .data(dist)
    .enter().append("rect")
      .attr("class","bar")
      .attr("x", d => x(d.times))
      .attr("y", d => y(d.customers))
      .attr("width", x.bandwidth())
      .attr("height", d => innerH - y(d.customers))
      .attr("fill","#3f78b5")
      .on("mouseover", function(event,d) {
        tooltip.transition().duration(200).style("opacity",1);
        tooltip.html(
          `Đã mua ${d.times} lần<br>Số KH: ${d.customers}`
        )
        .style("left",(event.pageX+10)+"px")
        .style("top",(event.pageY-28)+"px");
        d3.select(this).attr("fill","#2a5d9f");
      })
      .on("mousemove", function(event) {
        tooltip.style("left",(event.pageX+10)+"px")
               .style("top",(event.pageY-28)+"px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(300).style("opacity",0);
        d3.select(this).attr("fill","#3f78b5");
      });
  svg.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -height/2)
    .attr("y", 18)
    .attr("text-anchor","middle")
    .style("font-size","12px")
    .text("Số KH");
});
///////////////////// chart12 - PHÂN PHỐI MỨC CHI TRẢ ////////////////////
d3.csv("data.csv").then(function(data) {
  data.forEach(d => {
    d.customer = d["Mã khách hàng"];
    d.amount = +d["Thành tiền"];
  });

  // --- bước 1: mức chi trả mỗi khách hàng ---
  const customerSpend = d3.rollups(
    data,
    v => d3.sum(v, d => d.amount),
    d => d.customer
  ).map(([customer, spend]) => ({customer, spend}));

  // --- bước 2: gán bin cho từng khách hàng ---
  const binSize = 50000;
  const minVal = 18000, maxVal = 3935000;

  const withBin = customerSpend.map(d => {
    const binIndex = Math.floor(d.spend / binSize);
    const lower = binIndex * binSize;
    const upper = (binIndex + 1) * binSize;
    return { ...d, lower, upper };
  });

  // --- bước 3: gom nhóm theo bin và đếm số KH ---
  const dist = d3.rollups(
    withBin,
    v => v.length,
    d => `${d.lower}-${d.upper}`
  ).map(([range, cnt]) => {
      const [lower, upper] = range.split("-").map(Number);
      return { lower, upper, customers: cnt };
  }).sort((a,b) => d3.ascending(a.lower, b.lower));

  // --- chart size ---
  
  const width = 1000, height = 500;
  const margin = {top: 70, right: 30, bottom: 60, left: 80};

  const container = d3.select("#chart12").append("div")
    .style("text-align","center");

  const svg = container.append("svg")
    .attr("id","#chart12")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // --- scales ---
  const x = d3.scaleBand()
    .domain(dist.map(d => `${d.lower}-${d.upper}`))
    .range([0, innerW])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(dist, d => d.customers)]).nice()
    .range([innerH, 0]);

  // --- axes ---
  g.append("g")
    .attr("transform",`translate(0,${innerH})`)
    .call(
      d3.axisBottom(x)
        .tickValues(x.domain().filter((d,i)=> i%5===0)) // giảm bớt nhãn
        .tickFormat(d => {
          const [l,u] = d.split("-").map(Number);
          return `${u/1000}K`;   // hiển thị 50K, 100K ...
        })
    )
    .selectAll("text")
      .attr("text-anchor","end")
      .attr("transform","rotate(-45)");

  g.append("g").call(d3.axisLeft(y));

  // --- tooltip ---
  const tooltip = container.append("div")
    .style("position","absolute")
    .style("background","#fff")
    .style("border","1px solid #ccc")
    .style("padding","6px 10px")
    .style("border-radius","4px")
    .style("box-shadow","0px 2px 6px rgba(0,0,0,0.15)")
    .style("font-size","13px")
    .style("pointer-events","none")
    .style("opacity",0);

  // --- bars ---
  g.selectAll(".bar")
    .data(dist)
    .enter().append("rect")
      .attr("class","bar")
      .attr("x", d => x(`${d.lower}-${d.upper}`))
      .attr("y", d => y(d.customers))
      .attr("width", x.bandwidth())
      .attr("height", d => innerH - y(d.customers))
      .attr("fill","#5a9e6f")
      .on("mouseover", function(event,d) {
        tooltip.transition().duration(200).style("opacity",1);
        tooltip.html(
          `Đã chi tiêu Từ ${d.lower} đến ${d.upper}<br>Số KH: ${d.customers}`
        )
        .style("left",(event.pageX+10)+"px")
        .style("top",(event.pageY-28)+"px");
        d3.select(this).attr("fill","#437e56");
      })
      .on("mousemove", function(event) {
        tooltip.style("left",(event.pageX+10)+"px")
               .style("top",(event.pageY-28)+"px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(300).style("opacity",0);
        d3.select(this).attr("fill","#5a9e6f");
      });

  svg.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -height/2)
    .attr("y", 18)
    .attr("text-anchor","middle")
    .style("font-size","12px")
    .text("Số KH chi trả");
});







