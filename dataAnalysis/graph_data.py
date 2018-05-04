from glob import glob
import plotly as py
import plotly.graph_objs as go
import pandas as pd
py.tools.set_credentials_file(
    username='thesiti92', api_key='EJlcEUd49BIj9uTVpthA')
df = pd.read_json((glob("*.json")[0]))
data = [go.Scatter(
    x=df.date,
    y=df['temperature'])]

py.offline.plot(data)


# print(datetime.strptime(data[0]["date"], "%Y-%m-%dT%H:%M:%S.%fZ").timestamp())


# # Create a trace
# trace = go.Scatter(
#     x=country_vecs[:, 0],
#     y=country_vecs[:, 1],
#     mode='markers',
#     marker={"color": "red"},
#     name="temperature"
# )
# layout = go.Layout(
#     title='Temperature',
#     hovermode='closest',
#     xaxis=dict(
#         title='Time',
#         ticklen=5,
#         gridwidth=2
#     ),
#     yaxis=dict(
#         title='Temperature(C)',
#         ticklen=5,
#         gridwidth=2
#     )
# )

# data = [trace]
# fig = go.Figure(data=data, layout=layout)
# plot_url = py.plot(fig)
# print(plot_url)
